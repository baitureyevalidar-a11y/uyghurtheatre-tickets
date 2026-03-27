export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const paySchema = z.object({
  paymentId: z.string().min(1, 'paymentId is required'),
  paymentMethod: z.enum(['KASPI', 'CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH'] as const, {
    error: 'Invalid payment method',
  }),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = paySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { paymentId, paymentMethod } = parsed.data

    const order = await prisma.order.findUnique({
      where: { id },
      include: { tickets: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Access control: owner or admin
    if (session?.user) {
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'].includes(session.user.role)
      const isOwner = order.userId === session.user.id
      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (order.status === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 409 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot pay an order with status ${order.status}` },
        { status: 409 },
      )
    }

    const now = new Date()

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'PAID',
          paymentId,
          paymentMethod,
          paidAt: now,
        },
      })

      // Update all tickets to PAID
      await tx.ticket.updateMany({
        where: { orderId: id, status: 'RESERVED' },
        data: { status: 'PAID' },
      })

      return updated
    })

    // Re-fetch full order with tickets
    const fullOrder = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        tickets: {
          include: {
            seat: { include: { sector: true } },
            show: {
              include: {
                event: { select: { titleRu: true, titleKz: true, titleUy: true } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: fullOrder })
  } catch (error) {
    console.error('[POST /api/orders/[id]/pay]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
