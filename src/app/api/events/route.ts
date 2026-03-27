export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Genre } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const skip = (page - 1) * limit

    const now = new Date()

    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(genre ? { genre: genre as Genre } : {}),
        ...(search
          ? {
              OR: [
                { titleRu: { contains: search, mode: 'insensitive' } },
                { titleKz: { contains: search, mode: 'insensitive' } },
                { titleUy: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        shows: {
          some: {
            dateTime: { gte: now },
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
          },
        },
      },
      include: {
        shows: {
          where: {
            dateTime: { gte: now },
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
          },
          orderBy: { dateTime: 'asc' },
          take: 1,
          include: {
            priceTiers: {
              select: { price: true },
              orderBy: { price: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.event.count({
      where: {
        isActive: true,
        isDeleted: false,
        ...(genre ? { genre: genre as Genre } : {}),
        ...(search
          ? {
              OR: [
                { titleRu: { contains: search, mode: 'insensitive' } },
                { titleKz: { contains: search, mode: 'insensitive' } },
                { titleUy: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        shows: {
          some: {
            dateTime: { gte: now },
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
          },
        },
      },
    })

    const data = events.map((event) => {
      const firstShow = event.shows[0] ?? null
      const minPrice = firstShow?.priceTiers[0]?.price ?? null
      return {
        id: event.id,
        titleKz: event.titleKz,
        titleRu: event.titleRu,
        titleUy: event.titleUy,
        genre: event.genre,
        duration: event.duration,
        ageRestriction: event.ageRestriction,
        posterImage: event.posterImage,
        firstShowDate: firstShow?.dateTime ?? null,
        minPrice: minPrice !== null ? Number(minPrice) : null,
      }
    })

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
