export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        tickets: {
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
                  },
                },
                hall: { select: { id: true, name: true } },
              },
            },
          },
        },
        refunds: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only allow access to the owning user or admins
    if (session?.user) {
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'].includes(session.user.role)
      const isOwner = order.userId === session.user.id
      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ data: order })
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
