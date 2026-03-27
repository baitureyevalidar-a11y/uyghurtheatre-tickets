export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { ShowStatus, SeatType } from '@prisma/client'

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
    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        event: true,
        hall: { include: { sectors: { include: { seats: true } } } },
        priceTiers: { include: { sector: true } },
        _count: { select: { tickets: true } },
      },
    })
    if (!show) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: show })
  } catch (error) {
    console.error('[GET /api/admin/shows/[id]]', error)
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
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const existing = await prisma.show.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const {
      eventId, hallId, dateTime,
      ticketSalesStart, ticketSalesEnd,
      status, specialConditions, priceTiers,
    } = body as Record<string, unknown>

    const updated = await prisma.$transaction(async (tx) => {
      const updatedShow = await tx.show.update({
        where: { id },
        data: {
          ...(eventId !== undefined && { eventId: String(eventId) }),
          ...(hallId !== undefined && { hallId: String(hallId) }),
          ...(dateTime !== undefined && { dateTime: new Date(String(dateTime)) }),
          ...(ticketSalesStart !== undefined && { ticketSalesStart: new Date(String(ticketSalesStart)) }),
          ...(ticketSalesEnd !== undefined && { ticketSalesEnd: new Date(String(ticketSalesEnd)) }),
          ...(status !== undefined && { status: status as ShowStatus }),
          ...(specialConditions !== undefined && { specialConditions: specialConditions ? String(specialConditions) : null }),
        },
      })

      if (Array.isArray(priceTiers)) {
        await tx.priceTier.deleteMany({ where: { showId: id } })
        if (priceTiers.length > 0) {
          await tx.priceTier.createMany({
            data: (priceTiers as Array<Record<string, unknown>>).map((pt) => ({
              showId: id,
              sectorId: String(pt.sectorId),
              seatType: String(pt.seatType) as SeatType,
              price: Number(pt.price),
              currency: 'KZT',
            })),
          })
        }
      }

      return updatedShow
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SHOW',
        entityType: 'Show',
        entityId: id,
        details: { dateTime: updated.dateTime },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PUT /api/admin/shows/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const existing = await prisma.show.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only cancel — do not hard-delete
    await prisma.show.update({ where: { id }, data: { status: 'CANCELLED' } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CANCEL_SHOW',
        entityType: 'Show',
        entityId: id,
        details: { dateTime: existing.dateTime },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/shows/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
