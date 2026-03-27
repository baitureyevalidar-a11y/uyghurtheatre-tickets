export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { OrderStatus, PaymentMethod } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const where = {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(paymentMethod ? { paymentMethod: paymentMethod as PaymentMethod } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' as const } },
              { customerPhone: { contains: search, mode: 'insensitive' as const } },
              { customerName: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          tickets: {
            include: {
              show: { include: { event: { select: { titleRu: true } } } },
              seat: { include: { sector: { select: { name: true } } } },
            },
          },
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/admin/orders]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
