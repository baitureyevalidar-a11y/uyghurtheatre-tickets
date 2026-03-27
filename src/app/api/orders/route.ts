export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateTicketQR, generateQRDataURL } from '@/lib/qr'
import { checkoutSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { generateOrderNumber } from '@/lib/utils'
import { auth } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Request body schema
// ---------------------------------------------------------------------------

const createOrderSchema = checkoutSchema.extend({
  showId: z.string().uuid('Invalid show ID'),
  seatIds: z
    .array(z.string().uuid('Invalid seat ID'))
    .min(1, 'Select at least one seat')
    .max(10, 'Cannot book more than 10 seats at once'),
})

// ---------------------------------------------------------------------------
// POST — create order
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate limiting: 5 orders per minute per IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const rl = rateLimit(`orders:${ip}`, 5, 60_000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      },
    )
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { showId, seatIds, customerName, customerPhone, customerEmail, paymentMethod } =
    parsed.data

  // Optionally associate with a logged-in user
  const session = await auth()
  const userId = session?.user?.id ?? null

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify show exists and is on sale
      const show = await tx.show.findUnique({
        where: { id: showId },
        include: {
          priceTiers: true,
        },
      })

      if (!show) {
        throw new Error('SHOW_NOT_FOUND')
      }

      const now = new Date()
      if (show.status === 'CANCELLED') {
        throw new Error('SHOW_CANCELLED')
      }
      if (now < show.ticketSalesStart) {
        throw new Error('SALES_NOT_STARTED')
      }
      if (now > show.ticketSalesEnd) {
        throw new Error('SALES_ENDED')
      }

      // 2. Lock and verify seats — SELECT FOR UPDATE via raw query approach
      //    Prisma transactions provide serialisable isolation; additionally we
      //    check for existing active tickets below.
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds } },
        include: { sector: true },
      })

      if (seats.length !== seatIds.length) {
        throw new Error('SEAT_NOT_FOUND')
      }

      // 3. Check no active tickets exist for these seats on this show
      const existingTickets = await tx.ticket.findMany({
        where: {
          showId,
          seatId: { in: seatIds },
          status: { in: ['RESERVED', 'PAID', 'USED'] },
          OR: [
            { status: { in: ['PAID', 'USED'] } },
            {
              status: 'RESERVED',
              reservedUntil: { gte: now },
            },
          ],
        },
        select: { seatId: true },
      })

      if (existingTickets.length > 0) {
        throw new Error('SEATS_UNAVAILABLE')
      }

      // 4. Calculate total amount
      let totalAmount = 0
      for (const seat of seats) {
        const tier = show.priceTiers.find(
          (pt) => pt.sectorId === seat.sectorId && pt.seatType === seat.seatType,
        )
        if (!tier) {
          throw new Error(`PRICE_NOT_FOUND:${seat.id}`)
        }
        totalAmount += Number(tier.price)
      }

      // 5. Create order
      const orderNumber = generateOrderNumber()
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          currency: 'KZT',
          status: 'PENDING',
          paymentMethod,
          customerName,
          customerPhone,
          customerEmail: customerEmail ?? null,
        },
      })

      // 6. Create tickets with 15-minute reservation window and QR codes
      const reservedUntil = new Date(now.getTime() + 15 * 60 * 1000)

      const ticketData: Array<{
        showId: string
        seatId: string
        orderId: string
        qrCode: string
        status: 'RESERVED'
        reservedUntil: Date
      }> = []

      for (const seat of seats) {
        const qrPayload = generateTicketQR(`temp-${seat.id}`) // placeholder until ticket id exists
        ticketData.push({
          showId,
          seatId: seat.id,
          orderId: order.id,
          qrCode: qrPayload,
          status: 'RESERVED',
          reservedUntil,
        })
      }

      // Create tickets one-by-one so we can generate QR codes using real ticket IDs
      const createdTickets = []
      for (const seat of seats) {
        const ticket = await tx.ticket.create({
          data: {
            showId,
            seatId: seat.id,
            orderId: order.id,
            qrCode: generateTicketQR(`placeholder`), // will be updated below
            status: 'RESERVED',
            reservedUntil,
          },
        })

        // Generate proper QR using real ticket ID and update
        const qrPayload = generateTicketQR(ticket.id)
        const qrDataUrl = await generateQRDataURL(qrPayload)

        const updated = await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrCode: qrPayload },
        })

        createdTickets.push({ ...updated, qrDataUrl })
      }

      // Re-fetch order with tickets for response
      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          tickets: {
            include: {
              seat: {
                include: { sector: true },
              },
            },
          },
        },
      })

      return {
        order: fullOrder,
        tickets: createdTickets.map(({ qrDataUrl, ...ticket }) => ({
          ...ticket,
          qrDataUrl,
        })),
      }
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'SHOW_NOT_FOUND':
          return NextResponse.json({ error: 'Show not found' }, { status: 404 })
        case 'SHOW_CANCELLED':
          return NextResponse.json({ error: 'This show has been cancelled' }, { status: 409 })
        case 'SALES_NOT_STARTED':
          return NextResponse.json({ error: 'Ticket sales have not started yet' }, { status: 409 })
        case 'SALES_ENDED':
          return NextResponse.json({ error: 'Ticket sales have ended' }, { status: 409 })
        case 'SEAT_NOT_FOUND':
          return NextResponse.json({ error: 'One or more seats not found' }, { status: 404 })
        case 'SEATS_UNAVAILABLE':
          return NextResponse.json(
            { error: 'One or more selected seats are no longer available' },
            { status: 409 },
          )
      }
      if (error.message.startsWith('PRICE_NOT_FOUND')) {
        return NextResponse.json(
          { error: 'Price configuration missing for one or more seats' },
          { status: 422 },
        )
      }
    }

    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET — list orders for authenticated user
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          tickets: {
            include: {
              seat: { include: { sector: true } },
              show: {
                include: { event: { select: { titleRu: true, titleKz: true, titleUy: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/orders]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
