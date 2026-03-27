export const dynamic = 'force-dynamic';

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { formatDate, formatDateTime, formatPrice, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { routing } from '@/i18n/routing'
import {
  Clock,
  CalendarDays,
  Users,
  MapPin,
  ArrowLeft,
  Ticket,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Genre =
  | 'COMEDY'
  | 'DRAMA'
  | 'MUSICAL'
  | 'CONCERT'
  | 'CHILDREN'
  | 'FOLKLORE'
  | 'OTHER'

const GENRE_KEYS: Record<Genre, string> = {
  COMEDY: 'comedy',
  DRAMA: 'drama',
  MUSICAL: 'musical',
  CONCERT: 'concert',
  CHILDREN: 'children',
  FOLKLORE: 'folklore',
  OTHER: 'other',
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params

  const event = await prisma.event.findFirst({
    where: { id, isDeleted: false, isActive: true },
    select: {
      titleRu: true,
      titleKz: true,
      titleUy: true,
      descriptionRu: true,
      posterImage: true,
    },
  })

  if (!event) return { title: 'Not found' }

  const title =
    locale === 'ru'
      ? event.titleRu
      : locale === 'kz'
      ? event.titleKz
      : event.titleUy

  const description =
    locale === 'ru'
      ? event.descriptionRu.slice(0, 160)
      : event.descriptionRu.slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.posterImage ? [{ url: event.posterImage }] : [],
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { locale, id } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'event' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const now = new Date()

  const event = await prisma.event.findFirst({
    where: { id, isDeleted: false },
    include: {
      shows: {
        where: {
          dateTime: { gte: now },
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
        },
        orderBy: { dateTime: 'asc' },
        include: {
          hall: {
            select: { id: true, name: true, totalSeats: true },
          },
          priceTiers: {
            include: {
              sector: { select: { id: true, name: true, color: true } },
            },
            orderBy: { price: 'asc' },
          },
        },
      },
    },
  })

  if (!event) notFound()

  // Localised fields
  const title =
    locale === 'ru'
      ? event.titleRu
      : locale === 'kz'
      ? event.titleKz
      : event.titleUy

  const description =
    locale === 'ru'
      ? event.descriptionRu
      : locale === 'kz'
      ? event.descriptionKz
      : event.descriptionUy

  const dateLocale =
    locale === 'kz' ? 'kk-KZ' : 'ru-KZ'

  const genreKey = GENRE_KEYS[event.genre as Genre] ?? 'other'

  type ShowItem = (typeof event.shows)[number]

  // Build price table: group by sector → list of seat types + prices
  interface PriceRow {
    sectorId: string
    sectorName: string
    sectorColor: string
    seatType: string
    price: number
  }

  // Collect unique price rows from all shows (use the first show's tiers as representative)
  const priceRows: PriceRow[] = []
  const seenKeys = new Set<string>()
  for (const show of event.shows) {
    for (const tier of show.priceTiers) {
      const key = `${tier.sectorId}:${tier.seatType}`
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        priceRows.push({
          sectorId: tier.sectorId,
          sectorName: tier.sector.name,
          sectorColor: tier.sector.color,
          seatType: tier.seatType,
          price: Number(tier.price),
        })
      }
    }
    if (seenKeys.size > 0) break // one show's tiers is enough
  }

  const seatTypeLabel: Record<string, string> = {
    REGULAR: locale === 'ru' ? 'Обычное' : locale === 'kz' ? 'Қарапайым' : 'ئادەتتە',
    VIP: 'VIP',
    WHEELCHAIR: locale === 'ru' ? 'Для колясочников' : locale === 'kz' ? 'Инвалидтік арба' : 'نوگاي ئورۇن',
    RESTRICTED_VIEW: locale === 'ru' ? 'Ограниченный обзор' : locale === 'kz' ? 'Шектеулі көрініс' : 'چەكلەنگەن كۆرۈش',
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Hero ─── */}
      <div className="relative h-[420px] w-full overflow-hidden sm:h-[520px]">
        {/* Background poster */}
        {event.posterImage ? (
          <>
            <Image
              src={event.posterImage}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-darkBrown via-darkBrown/60 to-darkBrown/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-darkBrown" />
        )}

        {/* Content inside hero */}
        <div className="relative z-10 flex h-full flex-col justify-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href={`/${locale}/events`}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-cream/70 hover:text-cream transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === 'ru' ? 'Афиша' : locale === 'kz' ? 'Афиша' : 'تەدبىرلەر'}
            </Link>

            {/* Genre badge */}
            <div className="mb-3">
              <Badge variant="gold" size="md">
                {t(`genre.${genreKey}`)}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-bold text-cream sm:text-4xl lg:text-5xl max-w-3xl leading-tight">
              {title}
            </h1>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-cream/80">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold" />
                {event.duration} {locale === 'ru' ? 'мин.' : locale === 'kz' ? 'мин.' : 'مىنۇت'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold" />
                {event.ageRestriction}+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left: description + gallery */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <h2 className="mb-4 font-heading text-xl font-semibold text-darkBrown">
                {t('description')}
              </h2>
              <div className="prose prose-sm max-w-none text-brown leading-relaxed whitespace-pre-line">
                {description}
              </div>
            </section>

            {/* Details table */}
            <section>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-brown/10 bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brown/50">
                    {t('duration')}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 font-semibold text-darkBrown">
                    <Clock className="h-4 w-4 text-gold" />
                    {event.duration} {locale === 'ru' ? 'минут' : locale === 'kz' ? 'минут' : 'مىنۇت'}
                  </dd>
                </div>
                <div className="rounded-lg border border-brown/10 bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brown/50">
                    {t('ageRestriction')}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 font-semibold text-darkBrown">
                    <Users className="h-4 w-4 text-gold" />
                    {event.ageRestriction}+
                  </dd>
                </div>
              </dl>
            </section>

            {/* Gallery */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-semibold text-darkBrown">
                  {t('gallery')}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.galleryImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-lg bg-darkBrown/10"
                    >
                      <Image
                        src={img}
                        alt={`${title} — ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Schedule */}
            <section>
              <h2 className="mb-4 font-heading text-xl font-semibold text-darkBrown">
                {t('schedule')}
              </h2>

              {event.shows.length === 0 ? (
                <p className="text-brown/50 text-sm">{tCommon('noResults')}</p>
              ) : (
                <div className="space-y-3">
                  {event.shows.map((show: ShowItem) => {
                    const showMinPrice =
                      show.priceTiers.length > 0
                        ? Number(show.priceTiers[0].price)
                        : null
                    const showMaxPrice =
                      show.priceTiers.length > 0
                        ? Number(show.priceTiers[show.priceTiers.length - 1].price)
                        : null

                    return (
                      <div
                        key={show.id}
                        className="flex flex-col gap-3 rounded-xl border border-brown/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 font-semibold text-darkBrown">
                            <CalendarDays className="h-4 w-4 text-burgundy" />
                            {formatDateTime(show.dateTime, dateLocale)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-brown/60">
                            <MapPin className="h-3.5 w-3.5 text-gold" />
                            {show.hall.name}
                          </div>
                          {showMinPrice !== null && showMaxPrice !== null && (
                            <div className="flex items-center gap-1.5 text-sm text-burgundy font-medium">
                              <Ticket className="h-3.5 w-3.5" />
                              {showMinPrice === showMaxPrice
                                ? formatPrice(showMinPrice)
                                : `${formatPrice(showMinPrice)} – ${formatPrice(showMaxPrice)}`}
                            </div>
                          )}
                        </div>
                        <Button asChild variant="default" size="md" className="shrink-0">
                          <Link href={`/${locale}/shows/${show.id}/seats`}>
                            {t('selectSeats')}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right: price table (sticky on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-brown/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-heading text-lg font-semibold text-darkBrown">
                {t('prices')}
              </h2>

              {priceRows.length === 0 ? (
                <p className="text-sm text-brown/50">{tCommon('noResults')}</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brown/10">
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-brown/50">
                        {locale === 'ru' ? 'Сектор' : locale === 'kz' ? 'Сектор' : 'بۆلۈم'}
                      </th>
                      <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-brown/50">
                        {locale === 'ru' ? 'Тип' : locale === 'kz' ? 'Түрі' : 'تۈرى'}
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-brown/50">
                        {locale === 'ru' ? 'Цена' : locale === 'kz' ? 'Баға' : 'باھا'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-brown/5 last:border-0"
                      >
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: row.sectorColor }}
                            />
                            <span className="text-brown">{row.sectorName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-brown/70">
                          {seatTypeLabel[row.seatType] ?? row.seatType}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-burgundy">
                          {formatPrice(row.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* CTA button — links to first show's seat selection */}
              {event.shows[0] && (
                <div className="mt-6">
                  <Button asChild variant="default" size="lg" className="w-full">
                    <Link href={`/${locale}/shows/${event.shows[0].id}/seats`}>
                      <Ticket className="h-4 w-4" />
                      {t('selectSeats')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
