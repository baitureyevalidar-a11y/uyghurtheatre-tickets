export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { UserRole } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'SUPER_ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Prevent self-demotion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 409 })
    }

    const { role, isBlocked } = body as Record<string, unknown>

    const allowedRoles: UserRole[] = ['USER', 'ADMIN', 'CASHIER', 'SUPER_ADMIN']
    if (role !== undefined && !allowedRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 422 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role: role as UserRole }),
        ...(isBlocked !== undefined && { isBlocked: Boolean(isBlocked) }),
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
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: id,
        details: { role: String(role ?? ''), isBlocked: Boolean(isBlocked), targetUser: existing.fullName },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
