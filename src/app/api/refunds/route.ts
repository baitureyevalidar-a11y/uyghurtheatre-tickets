export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { refundRequestSchema } from '@/lib/validations'
import { calculateRefundAmount } from '@/lib/utils'
import { auth } from '@/lib/auth'

// ---------------------------------------------------------------------------
// POST — request a refund
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = refundRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { ticketId, reason } = parsed.data

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        show: { select: { dateTime: true } },
        order: {
          select: { userId: true, totalAmount: true, paymentMethod: true },
        },
        refunds: {
          where: { status: { notIn: ['REJECTED'] } },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Only allow the owning user or an admin to request a refund
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    const isOwner = ticket.order.userId === session.user.id
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (ticket.status !== 'PAID') {
      return NextResponse.json(
        { error: `Cannot refund a ticket with status ${ticket.status}` },
        { status: 409 },
      )
    }

    // Prevent duplicate refund requests
    if (ticket.refunds.length > 0) {
      return NextResponse.json(
        { error: 'A refund request already exists for this ticket' },
        { status: 409 },
      )
    }

    // Calculate refund amount based on time until the show
    const showDate = ticket.show.dateTime

    // Reject if less than 24 hours before show
    const hoursUntilShow = (showDate.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntilShow < 24) {
      return NextResponse.json(
        {
          error:
            'Refunds are not available less than 24 hours before the show',
        },
        { status: 409 },
      )
    }

    // Determine the per-ticket price from the order total divided evenly
    // (We use the full order amount as a reasonable proxy for a single ticket
    //  when no per-ticket price field exists on the Ticket model.)
    const ticketPrice = Number(ticket.order.totalAmount)
    const refundAmount = calculateRefundAmount(ticketPrice, showDate)

    const refund = await prisma.refund.create({
      data: {
        orderId: ticket.orderId,
        ticketId: ticket.id,
        amount: refundAmount,
        reason,
        status: 'REQUESTED',
      },
    })

    return NextResponse.json({ data: refund }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/refunds]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET — list refunds (admin only)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit
    const status = searchParams.get('status')

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where: status ? { status: status as never } : undefined,
        include: {
          order: {
            select: {
              orderNumber: true,
              customerName: true,
              customerPhone: true,
            },
          },
          ticket: {
            include: {
              seat: { include: { sector: true } },
              show: {
                include: {
                  event: {
                    select: { titleRu: true, titleKz: true, titleUy: true },
                  },
                },
              },
            },
          },
          processor: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.refund.count({
        where: status ? { status: status as never } : undefined,
      }),
    ])

    return NextResponse.json({
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/refunds]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
