export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const SETTINGS_KEYS = [
  'refund_pct_7plus',
  'refund_pct_3to7',
  'refund_pct_1to3',
  'refund_pct_under24h',
  'reservation_online_minutes',
  'reservation_cashier_hours',
  'theater_name',
  'theater_address',
  'theater_phone',
  'theater_email',
] as const

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const settings = await prisma.systemSettings.findMany()
    const settingsMap: Record<string, string> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    // Return defaults for missing keys
    const defaults: Record<string, string> = {
      refund_pct_7plus: '100',
      refund_pct_3to7: '70',
      refund_pct_1to3: '50',
      refund_pct_under24h: '0',
      reservation_online_minutes: '15',
      reservation_cashier_hours: '2',
      theater_name: 'Uyghur Theatre',
      theater_address: 'Алматы',
      theater_phone: '',
      theater_email: '',
    }

    const result: Record<string, string> = { ...defaults, ...settingsMap }
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[GET /api/admin/settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const updates = body as Record<string, unknown>
    const validKeys = SETTINGS_KEYS as readonly string[]

    const ops = Object.entries(updates)
      .filter(([key]) => validKeys.includes(key))
      .map(([key, value]) =>
        prisma.systemSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      )

    await Promise.all(ops)

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SETTINGS',
        entityType: 'SystemSettings',
        entityId: 'global',
        details: { keys: Object.keys(updates).filter((k) => validKeys.includes(k)) },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/admin/settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
