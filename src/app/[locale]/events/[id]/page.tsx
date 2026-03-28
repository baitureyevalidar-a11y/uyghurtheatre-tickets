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
  Sparkles,
  Star,
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

  const dateLocale = locale === 'kz' ? 'kk-KZ' : 'ru-KZ'
  const genreKey = GENRE_KEYS[event.genre as Genre] ?? 'other'

  type ShowItem = (typeof event.shows)[number]

  interface PriceRow {
    sectorId: string
    sectorName: string
    sectorColor: string
    seatType: string
    price: number
  }

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
    if (seenKeys.size > 0) break
  }

  const seatTypeLabel: Record<string, string> = {
    REGULAR: locale === 'ru' ? 'Обычное' : locale === 'kz' ? 'Қарапайым' : 'ئادەتتە',
    VIP: 'VIP',
    WHEELCHAIR: locale === 'ru' ? 'Для колясочников' : locale === 'kz' ? 'Инвалидтік арба' : 'نوگاي ئورۇن',
    RESTRICTED_VIEW: locale === 'ru' ? 'Ограниченный обзор' : locale === 'kz' ? 'Шектеулі көрініс' : 'چەكلەنگەن كۆرۈش',
  }

  const minPrice = priceRows.length > 0 ? Math.min(...priceRows.map(r => r.price)) : null

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Hero with parallax poster ─── */}
      <div className="relative h-[480px] w-full overflow-hidden sm:h-[560px]">
        {event.posterImage ? (
          <>
            <Image
              src={event.posterImage}
              alt={title}
              fill
              priority
              className="object-cover scale-110"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-darkBrown via-darkBrown/70 to-darkBrown/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-darkBrown/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-darkBrown via-burgundy/40 to-darkBrown">
            <div className="absolute inset-0 uyghur-pattern opacity-30" />
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="ornament-border" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/events`}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-cream/50 hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale === 'ru' ? 'Назад к афише' : locale === 'kz' ? 'Афишаға оралу' : 'تەدبىرلەرگە قايتىش'}
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-gold/90 text-darkBrown text-xs font-bold rounded-full uppercase tracking-wide">
                {t(`genre.${genreKey}`)}
              </span>
              {event.ageRestriction && (
                <span className="px-2.5 py-1 bg-white/10 text-cream text-xs font-bold rounded-full backdrop-blur-sm">
                  {event.ageRestriction}+
                </span>
              )}
            </div>

            <h1 className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl max-w-3xl leading-[1.1]">
              <span className="text-shimmer">{title}</span>
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-cream/70">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                {event.duration} {locale === 'ru' ? 'мин.' : locale === 'kz' ? 'мин.' : 'مىنۇت'}
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                {event.ageRestriction}+
              </span>
              {minPrice && (
                <span className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-gold" />
                  {locale === 'ru' ? 'от' : 'бастап'} {formatPrice(minPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-gold" />
                <h2 className="font-heading text-xl font-bold text-darkBrown">
                  {t('description')}
                </h2>
              </div>
              <div className="prose prose-sm max-w-none text-brown leading-relaxed whitespace-pre-line bg-white rounded-2xl p-6 border border-brown/10 shadow-sm">
                {description}
              </div>
            </section>

            {/* Details */}
            <section>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-darkBrown to-darkBrown/95 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-2">
                    {t('duration')}
                  </dt>
                  <dd className="flex items-center gap-2 font-heading font-bold text-cream text-lg">
                    <Clock className="h-5 w-5 text-gold" />
                    {event.duration} {locale === 'ru' ? 'минут' : locale === 'kz' ? 'минут' : 'مىنۇت'}
                  </dd>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-darkBrown to-darkBrown/95 p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-2">
                    {t('ageRestriction')}
                  </dt>
                  <dd className="flex items-center gap-2 font-heading font-bold text-cream text-lg">
                    <Users className="h-5 w-5 text-gold" />
                    {event.ageRestriction}+
                  </dd>
                </div>
              </dl>
            </section>

            {/* Gallery */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-gold" />
                  <h2 className="font-heading text-xl font-bold text-darkBrown">
                    {t('gallery')}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.galleryImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-xl bg-darkBrown/10 group cursor-pointer"
                    >
                      <Image
                        src={img}
                        alt={`${title} — ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-darkBrown/0 group-hover:bg-darkBrown/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Schedule */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays className="h-4 w-4 text-gold" />
                <h2 className="font-heading text-xl font-bold text-darkBrown">
                  {t('schedule')}
                </h2>
              </div>

              {event.shows.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-brown/10 bg-white">
                  <CalendarDays className="w-10 h-10 text-brown/20 mx-auto mb-3" />
                  <p className="text-brown/40 text-sm">{tCommon('noResults')}</p>
                </div>
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
                        className="flex flex-col gap-4 rounded-2xl border border-brown/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 font-heading font-bold text-darkBrown text-lg">
                            <CalendarDays className="h-5 w-5 text-burgundy" />
                            {formatDateTime(show.dateTime, dateLocale)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-brown/60">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-gold" />
                              {show.hall.name}
                            </span>
                            {showMinPrice !== null && showMaxPrice !== null && (
                              <span className="flex items-center gap-1.5 font-semibold text-burgundy">
                                <Ticket className="h-4 w-4" />
                                {showMinPrice === showMaxPrice
                                  ? formatPrice(showMinPrice)
                                  : `${formatPrice(showMinPrice)} – ${formatPrice(showMaxPrice)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/${locale}/shows/${show.id}/seats`}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-darkBrown font-bold rounded-full shadow-gold hover:shadow-gold-lg hover:scale-105 transition-all duration-300 text-sm uppercase tracking-wider shrink-0"
                        >
                          {t('selectSeats')}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right: price table (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-gold/20 bg-gradient-to-b from-darkBrown to-[#1A1A1A] p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <Ticket className="h-4 w-4 text-gold" />
                <h2 className="font-heading text-lg font-bold text-cream">
                  {t('prices')}
                </h2>
              </div>

              {priceRows.length === 0 ? (
                <p className="text-sm text-cream/40">{tCommon('noResults')}</p>
              ) : (
                <div className="space-y-2">
                  {priceRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 px-3 rounded-lg bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full ring-2 ring-white/10"
                          style={{ backgroundColor: row.sectorColor }}
                        />
                        <div>
                          <p className="text-cream text-sm font-medium">{row.sectorName}</p>
                          <p className="text-cream/40 text-xs">{seatTypeLabel[row.seatType] ?? row.seatType}</p>
                        </div>
                      </div>
                      <span className="font-heading font-bold text-gold text-lg">
                        {formatPrice(row.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {event.shows[0] && (
                <div className="mt-6">
                  <Link
                    href={`/${locale}/shows/${event.shows[0].id}/seats`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-gold to-gold-light text-darkBrown font-bold rounded-full shadow-gold hover:shadow-gold-lg hover:scale-[1.02] transition-all duration-300 text-sm uppercase tracking-wider"
                  >
                    <Ticket className="h-4 w-4" />
                    {t('selectSeats')}
                  </Link>
                </div>
              )}

              {/* Ornamental divider */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-cream/20 text-[10px] text-center uppercase tracking-[0.2em]">
                  Ұйғыр театры
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
