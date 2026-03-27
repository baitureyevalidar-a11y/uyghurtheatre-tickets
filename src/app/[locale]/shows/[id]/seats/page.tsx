export const dynamic = 'force-dynamic';

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { formatDateTime, cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import SeatMap, {
  type SeatData,
  type PriceTierData,
} from '@/components/seats/SeatMap'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'seats' })

  const show = await prisma.show.findUnique({
    where: { id },
    select: {
      dateTime: true,
      event: { select: { titleRu: true, titleKz: true, titleUy: true } },
    },
  })

  if (!show) return { title: 'Not found' }

  const eventTitle =
    locale === 'ru'
      ? show.event.titleRu
      : locale === 'kz'
      ? show.event.titleKz
      : show.event.titleUy

  return {
    title: `${t('selectYourSeats')} — ${eventTitle}`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function SeatSelectionPage({ params }: PageProps) {
  const { locale, id: showId } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'seats' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const now = new Date()

  // Fetch show with all nested data needed for the seat map
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      event: {
        select: {
          id: true,
          titleRu: true,
          titleKz: true,
          titleUy: true,
        },
      },
      hall: {
        include: {
          sectors: {
            include: {
              seats: {
                orderBy: [{ row: 'asc' }, { seatNumber: 'asc' }],
              },
            },
          },
        },
      },
      priceTiers: {
        include: {
          sector: { select: { id: true, name: true, color: true } },
        },
        orderBy: { price: 'asc' },
      },
      tickets: {
        where: {
          status: { in: ['RESERVED', 'PAID', 'USED'] },
        },
        select: {
          seatId: true,
          status: true,
          reservedUntil: true,
        },
      },
    },
  })

  if (!show) notFound()

  // Event title
  const eventTitle =
    locale === 'ru'
      ? show.event.titleRu
      : locale === 'kz'
      ? show.event.titleKz
      : show.event.titleUy

  const dateLocale = locale === 'kz' ? 'kk-KZ' : 'ru-KZ'

  // Build occupied-seat map (treat expired reservations as available)
  const takenSeatIds = new Set<string>()
  const reservedSeatIds = new Set<string>()
  for (const ticket of show.tickets) {
    if (ticket.status === 'PAID' || ticket.status === 'USED') {
      takenSeatIds.add(ticket.seatId)
    } else if (ticket.status === 'RESERVED') {
      if (!ticket.reservedUntil || ticket.reservedUntil >= now) {
        reservedSeatIds.add(ticket.seatId)
      }
    }
  }

  type SectorWithSeats = (typeof show.hall.sectors)[number]
  type SeatRecord = SectorWithSeats['seats'][number]
  type PriceTierRecord = (typeof show.priceTiers)[number]

  // Flatten seats from sectors
  const seats: SeatData[] = show.hall.sectors.flatMap((sector: SectorWithSeats) =>
    sector.seats.map((seat: SeatRecord) => {
      let availability: SeatData['availability'] = 'available'
      if (takenSeatIds.has(seat.id)) {
        availability = 'occupied'
      } else if (reservedSeatIds.has(seat.id)) {
        availability = 'reserved'
      }
      return {
        id: seat.id,
        row: seat.row,
        seatNumber: seat.seatNumber,
        x: seat.x,
        y: seat.y,
        seatType: seat.seatType as SeatData['seatType'],
        sector: {
          id: sector.id,
          name: sector.name,
          color: sector.color,
        },
        availability,
      }
    }),
  )

  // Price tiers
  const priceTiers: PriceTierData[] = show.priceTiers.map((tier: PriceTierRecord) => ({
    id: tier.id,
    sectorId: tier.sectorId,
    seatType: tier.seatType,
    price: Number(tier.price),
    currency: tier.currency,
    sector: tier.sector,
  }))

  return (
    <div className="min-h-screen bg-cream">
      {/* Show info header */}
      <div className="border-b border-gold/20 bg-darkBrown">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/events/${show.event.id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-cream/60 hover:text-cream transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {eventTitle}
          </Link>

          <h1 className="font-heading text-2xl font-bold text-cream sm:text-3xl">
            {t('selectYourSeats')}
          </h1>

          {/* Show metadata row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-cream/70">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold" />
              {formatDateTime(show.dateTime, dateLocale)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" />
              {show.hall.name}
            </span>
            {show.hall.totalSeats && (
              <span className="text-cream/50">
                {locale === 'ru'
                  ? `${show.hall.totalSeats} мест`
                  : locale === 'kz'
                  ? `${show.hall.totalSeats} орын`
                  : `${show.hall.totalSeats} ئورۇن`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Seat map */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {seats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-brown/15 bg-white py-20 text-center">
            <p className="font-heading text-xl text-brown/50">
              {tCommon('noResults')}
            </p>
          </div>
        ) : (
          <SeatMap seats={seats} priceTiers={priceTiers} showId={showId} />
        )}
      </div>
    </div>
  )
}
