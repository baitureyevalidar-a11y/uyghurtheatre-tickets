export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
    const skip = (page - 1) * limit
    const exportCsv = searchParams.get('export') === 'csv'

    const where = {
      ...(userId ? { userId } : {}),
      ...(action ? { action: { contains: action, mode: 'insensitive' as const } } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    }

    if (exportCsv) {
      const logs = await prisma.auditLog.findMany({
        where,
        include: { user: { select: { fullName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10000,
      })

      const header = 'Date,User,Action,Entity Type,Entity ID,IP Address,Details\n'
      const rows = logs
        .map((log) => {
          const date = log.createdAt.toISOString()
          const user = log.user ? `${log.user.fullName} (${log.user.phone})` : 'System'
          const details = log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ''
          return `"${date}","${user}","${log.action}","${log.entityType}","${log.entityId}","${log.ipAddress ?? ''}","${details}"`
        })
        .join('\n')

      return new Response(header + rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { fullName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/admin/audit]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
