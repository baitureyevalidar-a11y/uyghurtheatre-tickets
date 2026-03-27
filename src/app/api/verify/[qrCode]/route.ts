export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyTicketQR } from '@/lib/qr'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> },
) {
  try {
    const { qrCode } = await params

    // Decode and verify HMAC signature of the QR payload
    const decoded = verifyTicketQR(decodeURIComponent(qrCode))

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or tampered QR code', valid: false },
        { status: 400 },
      )
    }

    const { ticketId, issuedAt } = decoded

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        seat: {
          include: { sector: { select: { id: true, name: true, color: true } } },
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
            hall: { select: { id: true, name: true } },
          },
        },
        order: {
          select: {
            orderNumber: true,
            customerName: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found', valid: false },
        { status: 404 },
      )
    }

    // Confirm the stored QR code matches (guards against reused ticket IDs with new QRs)
    if (ticket.qrCode !== decodeURIComponent(qrCode)) {
      return NextResponse.json(
        { error: 'QR code does not match ticket record', valid: false },
        { status: 400 },
      )
    }

    const isValid = ticket.status === 'PAID' || ticket.status === 'USED'

    return NextResponse.json({
      valid: isValid,
      issuedAt: new Date(issuedAt).toISOString(),
      data: {
        id: ticket.id,
        status: ticket.status,
        usedAt: ticket.usedAt,
        seat: ticket.seat,
        show: ticket.show,
        order: ticket.order,
      },
    })
  } catch (error) {
    console.error('[GET /api/verify/[qrCode]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
