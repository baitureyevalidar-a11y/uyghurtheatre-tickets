export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'SUPER_ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const where = {
      ...(role ? { role: role as UserRole } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'SUPER_ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { fullName, phone, email, role, password } = body as Record<string, unknown>

    if (!fullName || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
    }

    const allowedRoles: UserRole[] = ['ADMIN', 'CASHIER', 'SUPER_ADMIN']
    const userRole = (role as UserRole | undefined) ?? 'CASHIER'
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 422 })
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: String(phone) } })
    if (existingPhone) return NextResponse.json({ error: 'Phone already in use' }, { status: 409 })

    const passwordHash = await bcrypt.hash(String(password), 12)
    const user = await prisma.user.create({
      data: {
        fullName: String(fullName),
        phone: String(phone),
        email: email ? String(email) : undefined,
        role: userRole,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: user.id,
        details: { fullName: user.fullName, role: user.role },
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/users]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
