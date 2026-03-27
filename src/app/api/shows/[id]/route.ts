export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        event: true,
        hall: {
          include: {
            sectors: {
              include: {
                seats: {
                  orderBy: [{ row: 'asc' }, { seatNumber: 'asc' }],
                },
              },
            },
          },
        },
        priceTiers: {
          include: {
            sector: { select: { id: true, name: true, color: true } },
          },
        },
        tickets: {
          where: {
            status: { in: ['RESERVED', 'PAID', 'USED'] },
          },
          select: { seatId: true, status: true, reservedUntil: true },
        },
      },
    })

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 })
    }

    const now = new Date()

    // Build a map of seatId -> ticket status, treating expired reservations as available
    const seatStatusMap = new Map<string, 'reserved' | 'occupied'>()
    for (const ticket of show.tickets) {
      if (ticket.status === 'RESERVED') {
        if (ticket.reservedUntil && ticket.reservedUntil < now) {
          // Reservation has expired — treat as available
          continue
        }
        seatStatusMap.set(ticket.seatId, 'reserved')
      } else {
        // PAID or USED
        seatStatusMap.set(ticket.seatId, 'occupied')
      }
    }

    // Group seats by sector and annotate availability
    const sectorsBySectorId = new Map<string, {
      id: string
      name: string
      color: string
      seats: Array<{
        id: string
        row: number
        seatNumber: number
        x: number
        y: number
        seatType: string
        availability: 'available' | 'reserved' | 'occupied'
      }>
    }>()

    for (const sector of show.hall.sectors) {
      const annotatedSeats = sector.seats.map((seat) => {
        const status = seatStatusMap.get(seat.id)
        return {
          id: seat.id,
          row: seat.row,
          seatNumber: seat.seatNumber,
          x: seat.x,
          y: seat.y,
          seatType: seat.seatType,
          availability: (status ?? 'available') as 'available' | 'reserved' | 'occupied',
        }
      })

      sectorsBySectorId.set(sector.id, {
        id: sector.id,
        name: sector.name,
        color: sector.color,
        seats: annotatedSeats,
      })
    }

    const response = {
      id: show.id,
      dateTime: show.dateTime,
      ticketSalesStart: show.ticketSalesStart,
      ticketSalesEnd: show.ticketSalesEnd,
      status: show.status,
      specialConditions: show.specialConditions,
      event: show.event,
      hall: {
        id: show.hall.id,
        name: show.hall.name,
        totalSeats: show.hall.totalSeats,
        seatMapSVG: show.hall.seatMapSVG,
        sectors: Array.from(sectorsBySectorId.values()),
      },
      priceTiers: show.priceTiers,
    }

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('[GET /api/shows/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
