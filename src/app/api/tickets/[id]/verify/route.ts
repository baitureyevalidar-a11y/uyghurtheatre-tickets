export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        seat: {
          include: { sector: true },
        },
        show: {
          include: {
            event: {
              select: {
                id: true,
                titleRu: true,
                titleKz: true,
                titleUy: true,
                posterImage: true,
                genre: true,
                ageRestriction: true,
              },
            },
            hall: {
              select: { id: true, name: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerPhone: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        status: ticket.status,
        reservedUntil: ticket.reservedUntil,
        usedAt: ticket.usedAt,
        createdAt: ticket.createdAt,
        seat: ticket.seat,
        show: ticket.show,
        order: ticket.order,
      },
    })
  } catch (error) {
    console.error('[GET /api/tickets/[id]/verify]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
