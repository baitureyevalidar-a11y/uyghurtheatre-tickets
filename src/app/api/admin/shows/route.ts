export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { ShowStatus } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const upcoming = searchParams.get('upcoming') // simple flag for cashier
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const now = new Date()

    const where = {
      ...(eventId ? { eventId } : {}),
      ...(status ? { status: status as ShowStatus } : {}),
      ...(upcoming === 'true' ? { dateTime: { gte: now }, status: { in: ['SCHEDULED', 'ON_SALE'] as ShowStatus[] } } : {}),
      ...(dateFrom || dateTo
        ? {
            dateTime: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    }

    const [shows, total] = await Promise.all([
      prisma.show.findMany({
        where,
        include: {
          event: { select: { titleRu: true, titleKz: true, titleUy: true } },
          hall: { select: { name: true, totalSeats: true } },
          _count: { select: { tickets: true } },
        },
        orderBy: { dateTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.show.count({ where }),
    ])

    // Calculate revenue for each show
    const showsWithRevenue = await Promise.all(
      shows.map(async (show) => {
        const revenue = await prisma.order.aggregate({
          where: {
            tickets: { some: { showId: show.id, status: { in: ['PAID', 'USED'] } } },
            status: { in: ['PAID', 'PARTIALLY_REFUNDED'] },
          },
          _sum: { totalAmount: true },
        })
        return {
          ...show,
          revenue: Number(revenue._sum.totalAmount ?? 0),
        }
      }),
    )

    return NextResponse.json({
      data: showsWithRevenue,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/admin/shows]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const {
      eventId, hallId, dateTime,
      ticketSalesStart, ticketSalesEnd,
      specialConditions, priceTiers,
    } = body as Record<string, unknown>

    if (!eventId || !hallId || !dateTime || !ticketSalesStart || !ticketSalesEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
    }

    const show = await prisma.$transaction(async (tx) => {
      const newShow = await tx.show.create({
        data: {
          eventId: String(eventId),
          hallId: String(hallId),
          dateTime: new Date(String(dateTime)),
          ticketSalesStart: new Date(String(ticketSalesStart)),
          ticketSalesEnd: new Date(String(ticketSalesEnd)),
          specialConditions: specialConditions ? String(specialConditions) : null,
          status: 'SCHEDULED',
        },
      })

      if (Array.isArray(priceTiers) && priceTiers.length > 0) {
        await tx.priceTier.createMany({
          data: (priceTiers as Array<Record<string, unknown>>).map((pt) => ({
            showId: newShow.id,
            sectorId: String(pt.sectorId),
            seatType: String(pt.seatType) as import('@prisma/client').SeatType,
            price: Number(pt.price),
            currency: 'KZT',
          })),
        })
      }

      return newShow
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_SHOW',
        entityType: 'Show',
        entityId: show.id,
        details: { eventId: String(eventId), dateTime: String(dateTime) },
      },
    })

    return NextResponse.json({ data: show }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/shows]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
