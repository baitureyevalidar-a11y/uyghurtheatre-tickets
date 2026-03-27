export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: { select: { orderNumber: true, customerName: true, customerPhone: true } },
        ticket: {
          include: {
            show: { include: { event: { select: { titleRu: true } } } },
            seat: { include: { sector: { select: { name: true } } } },
          },
        },
        processor: { select: { fullName: true } },
      },
    })
    if (!refund) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: refund })
  } catch (error) {
    console.error('[GET /api/admin/refunds/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const existing = await prisma.refund.findUnique({
      where: { id },
      include: { order: true },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.status !== 'REQUESTED') {
      return NextResponse.json({ error: 'Refund already processed' }, { status: 409 })
    }

    const { action, refundAmount, refundMethod, comment } = body as Record<string, unknown>

    if (action === 'approve') {
      const amount = refundAmount !== undefined ? Number(refundAmount) : Number(existing.amount)
      const updated = await prisma.$transaction(async (tx) => {
        const refund = await tx.refund.update({
          where: { id },
          data: {
            status: 'APPROVED',
            amount,
            refundMethod: refundMethod ? String(refundMethod) as import('@prisma/client').RefundMethod : 'ORIGINAL_PAYMENT',
            processedBy: session.user.id,
            processedAt: new Date(),
          },
        })

        // Update ticket status to REFUNDED
        await tx.ticket.update({
          where: { id: existing.ticketId },
          data: { status: 'REFUNDED' },
        })

        // Check if all tickets in the order are refunded
        const orderTickets = await tx.ticket.findMany({
          where: { orderId: existing.orderId },
        })
        const allRefunded = orderTickets.every((t) =>
          t.id === existing.ticketId ? true : t.status === 'REFUNDED',
        )
        await tx.order.update({
          where: { id: existing.orderId },
          data: { status: allRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED' },
        })

        return refund
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'APPROVE_REFUND',
          entityType: 'Refund',
          entityId: id,
          details: { amount: Number(amount), refundMethod: String(refundMethod ?? ''), orderId: existing.orderId },
        },
      })

      return NextResponse.json({ data: updated })
    }

    if (action === 'reject') {
      const updated = await prisma.refund.update({
        where: { id },
        data: {
          status: 'REJECTED',
          processedBy: session.user.id,
          processedAt: new Date(),
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'REJECT_REFUND',
          entityType: 'Refund',
          entityId: id,
          details: { comment: String(comment ?? ''), orderId: existing.orderId },
        },
      })

      return NextResponse.json({ data: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[PUT /api/admin/refunds/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
