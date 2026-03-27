export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { Genre } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const activeFilter = searchParams.get('active') // 'true' | 'false' | null
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const where = {
      isDeleted: false,
      ...(genre ? { genre: genre as Genre } : {}),
      ...(activeFilter !== null ? { isActive: activeFilter === 'true' } : {}),
      ...(search
        ? {
            OR: [
              { titleRu: { contains: search, mode: 'insensitive' as const } },
              { titleKz: { contains: search, mode: 'insensitive' as const } },
              { titleUy: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { _count: { select: { shows: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[GET /api/admin/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const {
      titleKz, titleRu, titleUy,
      descriptionKz, descriptionRu, descriptionUy,
      posterImage, galleryImages,
      genre, duration, ageRestriction, isActive,
    } = body as Record<string, unknown>

    if (!titleRu || !titleKz || !titleUy || !genre || !duration || !ageRestriction || !posterImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 422 })
    }

    const event = await prisma.event.create({
      data: {
        titleKz: String(titleKz),
        titleRu: String(titleRu),
        titleUy: String(titleUy),
        descriptionKz: String(descriptionKz ?? ''),
        descriptionRu: String(descriptionRu ?? ''),
        descriptionUy: String(descriptionUy ?? ''),
        posterImage: String(posterImage),
        galleryImages: Array.isArray(galleryImages) ? galleryImages.map(String) : [],
        genre: genre as Genre,
        duration: Number(duration),
        ageRestriction: String(ageRestriction),
        isActive: isActive !== false,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_EVENT',
        entityType: 'Event',
        entityId: event.id,
        details: { titleRu: event.titleRu },
      },
    })

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
