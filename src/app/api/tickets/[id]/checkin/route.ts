export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Check-in requires staff authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'].includes(session.user.role)
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        seat: { include: { sector: true } },
        show: {
          include: {
            event: {
              select: { titleRu: true, titleKz: true, titleUy: true },
            },
            hall: { select: { name: true } },
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status === 'USED') {
      return NextResponse.json(
        {
          error: 'Ticket has already been used',
          usedAt: ticket.usedAt,
        },
        { status: 409 },
      )
    }

    if (ticket.status !== 'PAID') {
      return NextResponse.json(
        {
          error: `Cannot check in a ticket with status ${ticket.status}`,
        },
        { status: 409 },
      )
    }

    const now = new Date()

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'USED',
        usedAt: now,
      },
      include: {
        seat: { include: { sector: true } },
        show: {
          include: {
            event: {
              select: { titleRu: true, titleKz: true, titleUy: true },
            },
            hall: { select: { name: true } },
          },
        },
        order: {
          select: { orderNumber: true, customerName: true },
        },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[POST /api/tickets/[id]/checkin]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
