export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { Genre } from '@prisma/client'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER'] as const

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number]))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id, isDeleted: false },
      include: { shows: { orderBy: { dateTime: 'asc' } } },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error('[GET /api/admin/events/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const existing = await prisma.event.findUnique({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const {
      titleKz, titleRu, titleUy,
      descriptionKz, descriptionRu, descriptionUy,
      posterImage, galleryImages,
      genre, duration, ageRestriction, isActive,
    } = body as Record<string, unknown>

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(titleKz !== undefined && { titleKz: String(titleKz) }),
        ...(titleRu !== undefined && { titleRu: String(titleRu) }),
        ...(titleUy !== undefined && { titleUy: String(titleUy) }),
        ...(descriptionKz !== undefined && { descriptionKz: String(descriptionKz) }),
        ...(descriptionRu !== undefined && { descriptionRu: String(descriptionRu) }),
        ...(descriptionUy !== undefined && { descriptionUy: String(descriptionUy) }),
        ...(posterImage !== undefined && { posterImage: String(posterImage) }),
        ...(galleryImages !== undefined && {
          galleryImages: Array.isArray(galleryImages) ? galleryImages.map(String) : [],
        }),
        ...(genre !== undefined && { genre: genre as Genre }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(ageRestriction !== undefined && { ageRestriction: String(ageRestriction) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: { titleRu: updated.titleRu },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[PUT /api/admin/events/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const existing = await prisma.event.findUnique({ where: { id, isDeleted: false } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.event.update({ where: { id }, data: { isDeleted: true, isActive: false } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: { titleRu: existing.titleRu },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/events/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
