export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 30)

    // Tickets sold counts
    const [ticketsToday, ticketsWeek, ticketsMonth] = await Promise.all([
      prisma.ticket.count({
        where: { status: { in: ['PAID', 'USED'] }, createdAt: { gte: todayStart } },
      }),
      prisma.ticket.count({
        where: { status: { in: ['PAID', 'USED'] }, createdAt: { gte: weekStart } },
      }),
      prisma.ticket.count({
        where: { status: { in: ['PAID', 'USED'] }, createdAt: { gte: monthStart } },
      }),
    ])

    // Revenue
    const revenueResult = await prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] }, createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    })
    const revenueMonth = Number(revenueResult._sum.totalAmount ?? 0)

    // Active reservations
    const activeReservations = await prisma.ticket.count({
      where: { status: 'RESERVED', reservedUntil: { gte: now } },
    })

    // Refund requests
    const refundRequests = await prisma.refund.count({
      where: { status: 'REQUESTED' },
    })

    // Hall occupancy (upcoming shows)
    const upcomingShows = await prisma.show.findMany({
      where: { dateTime: { gte: now }, status: { in: ['SCHEDULED', 'ON_SALE'] } },
      include: {
        hall: { select: { totalSeats: true } },
        _count: { select: { tickets: true } },
      },
    })
    let occupancyPct = 0
    if (upcomingShows.length > 0) {
      const totalSeats = upcomingShows.reduce((s, sh) => s + sh.hall.totalSeats, 0)
      const soldSeats = upcomingShows.reduce((s, sh) => s + sh._count.tickets, 0)
      occupancyPct = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0
    }

    // Daily sales for last 30 days
    const tickets30 = await prisma.ticket.findMany({
      where: { status: { in: ['PAID', 'USED'] }, createdAt: { gte: monthStart } },
      select: { createdAt: true },
    })

    const dailyMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = 0
    }
    for (const t of tickets30) {
      const key = t.createdAt.toISOString().split('T')[0]
      if (key in dailyMap) dailyMap[key]++
    }
    const dailySales = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Revenue by event (top 10)
    const revenueByEventRaw = await prisma.order.findMany({
      where: { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } },
      select: {
        totalAmount: true,
        tickets: {
          select: {
            show: {
              select: { event: { select: { id: true, titleRu: true } } },
            },
          },
          take: 1,
        },
      },
      take: 500,
    })

    const eventRevMap: Record<string, { title: string; revenue: number }> = {}
    for (const order of revenueByEventRaw) {
      const event = order.tickets[0]?.show?.event
      if (!event) continue
      if (!eventRevMap[event.id]) {
        eventRevMap[event.id] = { title: event.titleRu, revenue: 0 }
      }
      eventRevMap[event.id].revenue += Number(order.totalAmount)
    }
    const revenueByEvent = Object.values(eventRevMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Popular shows by tickets sold
    const popularShows = await prisma.show.findMany({
      where: { tickets: { some: { status: { in: ['PAID', 'USED'] } } } },
      include: {
        event: { select: { titleRu: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { tickets: { _count: 'desc' } },
      take: 8,
    })
    const popularShowsData = popularShows.map((s) => ({
      name: `${s.event.titleRu} (${new Date(s.dateTime).toLocaleDateString('ru-KZ')})`,
      tickets: s._count.tickets,
    }))

    return NextResponse.json({
      stats: {
        ticketsToday,
        ticketsWeek,
        ticketsMonth,
        revenueMonth,
        occupancyPct,
        activeReservations,
        refundRequests,
      },
      dailySales,
      revenueByEvent,
      popularShows: popularShowsData,
    })
  } catch (error) {
    console.error('[GET /api/admin/dashboard]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
