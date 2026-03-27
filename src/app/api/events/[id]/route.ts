export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const event = await prisma.event.findFirst({
      where: { id, isDeleted: false },
      include: {
        shows: {
          where: { status: { notIn: ['CANCELLED'] } },
          orderBy: { dateTime: 'asc' },
          include: {
            hall: {
              select: {
                id: true,
                name: true,
                totalSeats: true,
              },
            },
            priceTiers: {
              include: {
                sector: {
                  select: { id: true, name: true, color: true },
                },
              },
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error('[GET /api/events/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
