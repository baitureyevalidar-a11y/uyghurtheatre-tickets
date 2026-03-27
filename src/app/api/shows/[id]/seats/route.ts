export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: showId } = await params

    // Verify show exists
    const show = await prisma.show.findUnique({
      where: { id: showId },
      select: { id: true, hallId: true },
    })

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 })
    }

    const now = new Date()

    // Fetch all seats for the hall, joined with active tickets for this show
    const seats = await prisma.seat.findMany({
      where: {
        sector: { hallId: show.hallId },
      },
      include: {
        sector: { select: { id: true, name: true, color: true } },
        tickets: {
          where: {
            showId,
            status: { in: ['RESERVED', 'PAID', 'USED'] },
          },
          select: { status: true, reservedUntil: true },
        },
      },
      orderBy: [{ sector: { name: 'asc' } }],
    })

    const data = seats.map((seat) => {
      let availability: 'available' | 'reserved' | 'occupied' = 'available'

      const ticket = seat.tickets[0]
      if (ticket) {
        if (ticket.status === 'RESERVED') {
          if (!ticket.reservedUntil || ticket.reservedUntil >= now) {
            availability = 'reserved'
          }
          // else: expired reservation — available
        } else {
          // PAID or USED
          availability = 'occupied'
        }
      }

      return {
        id: seat.id,
        row: seat.row,
        seatNumber: seat.seatNumber,
        x: seat.x,
        y: seat.y,
        seatType: seat.seatType,
        sector: seat.sector,
        availability,
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/shows/[id]/seats]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
