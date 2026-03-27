export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { OrderStatus } from '@prisma/client'

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
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            show: {
              include: {
                event: { select: { titleRu: true, titleKz: true } },
                hall: { select: { name: true } },
              },
            },
            seat: {
              include: { sector: { select: { name: true, color: true } } },
            },
          },
        },
        refunds: {
          include: { processor: { select: { fullName: true } } },
        },
        user: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('[GET /api/admin/orders/[id]]', error)
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

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { status, paymentMethod } = body as Record<string, unknown>

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status as OrderStatus
    if (paymentMethod !== undefined) updateData.paymentMethod = String(paymentMethod)
    if (status === 'PAID') {
      updateData.paidAt = new Date()
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    })

    // If confirming cash payment, update ticket statuses to PAID
    if (status === 'PAID') {
      await prisma.ticket.updateMany({
        where: { orderId: id, status: 'RESERVED' },
        data: { status: 'PAID' },
      })
    }

    // If cancelling, release tickets
    if (status === 'CANCELLED') {
      await prisma.ticket.updateMany({
        where: { orderId: id },
        data: { status: 'CANCELLED' },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'Order',
        entityId: id,
        details: { status: String(status), orderNumber: existing.orderNumber },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PUT /api/admin/orders/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
