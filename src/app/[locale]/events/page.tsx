export const dynamic = 'force-dynamic';

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'
import { CalendarDays, Clock, Users, Sparkles, ArrowRight, Calendar } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types / helpers
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

const ALL_GENRES: Genre[] = [
  'COMEDY',
  'DRAMA',
  'MUSICAL',
  'CONCERT',
  'CHILDREN',
  'FOLKLORE',
  'OTHER',
]

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return {
    title: t('events'),
    description:
      locale === 'ru'
        ? 'Все спектакли и концерты Уйгурского театра — Алматы'
        : locale === 'kz'
        ? 'Ұйғыр театрының барлық қойылымдары мен концерттері — Алматы'
        : 'ئۇيغۇر تىياتىرىنىڭ بارلىق تاماشىلىرى — ئالماتا',
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ genre?: string }>
}

export default async function EventsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { genre: genreParam } = await searchParams

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'event' })
  const tHome = await getTranslations({ locale, namespace: 'home' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const now = new Date()
  const genreFilter = ALL_GENRES.includes(genreParam as Genre)
    ? (genreParam as Genre)
    : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let events: any[] = []
  try {
    events = await prisma.event.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(genreFilter ? { genre: genreFilter } : {}),
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
    })
  } catch {
    // DB not ready yet
  }

  type EventItem = (typeof events)[number]

  function getTitle(event: EventItem) {
    if (locale === 'ru') return event.titleRu
    if (locale === 'kz') return event.titleKz
    return event.titleUy
  }

  const pageTitle =
    locale === 'ru' ? 'Афиша' : locale === 'kz' ? 'Афиша' : 'تەدبىرلەر'

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Page header with theatrical style ─── */}
      <div className="relative overflow-hidden bg-darkBrown">
        <div className="absolute inset-0 uyghur-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-darkBrown/80 to-darkBrown" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="ornament-border" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-gold mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'Репертуар' : 'Репертуар'}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="text-shimmer">{pageTitle}</span>
          </h1>
          <p className="mt-4 text-cream/50 font-body text-sm max-w-md mx-auto">
            {tHome('upcomingShows')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Genre filter pills */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/${locale}/events`}
            className={cn(
              'rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
              !genreFilter
                ? 'bg-gradient-to-r from-gold to-gold-light text-darkBrown border-gold shadow-gold'
                : 'bg-white text-brown border-brown/15 hover:border-gold/40 hover:text-burgundy',
            )}
          >
            {locale === 'ru' ? 'Все' : 'Барлығы'}
          </Link>
          {ALL_GENRES.map((g) => (
            <Link
              key={g}
              href={`/${locale}/events?genre=${g}`}
              className={cn(
                'rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border',
                genreFilter === g
                  ? 'bg-gradient-to-r from-gold to-gold-light text-darkBrown border-gold shadow-gold'
                  : 'bg-white text-brown border-brown/15 hover:border-gold/40 hover:text-burgundy',
              )}
            >
              {t(`genre.${GENRE_KEYS[g]}`)}
            </Link>
          ))}
        </div>

        {/* Events grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-darkBrown/5 py-24 text-center">
            <Calendar className="mb-4 h-12 w-12 text-gold/30" />
            <p className="font-heading text-xl font-semibold text-brown/50">{tCommon('noResults')}</p>
            <p className="mt-2 text-sm text-brown/30">
              {locale === 'ru' ? 'Нет мероприятий в этой категории' : 'Бұл санатта тәдбірлер жоқ'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event: EventItem) => {
              const firstShow = event.shows[0] ?? null
              const minPrice = firstShow?.priceTiers[0]?.price
                ? Number(firstShow.priceTiers[0].price)
                : null

              return (
                <Link
                  key={event.id}
                  href={`/${locale}/events/${event.id}`}
                  className="card-theatrical group block h-80 sm:h-96"
                >
                  {/* Poster / gradient placeholder */}
                  {event.posterImage ? (
                    <Image
                      src={event.posterImage}
                      alt={getTitle(event)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-burgundy-dark to-darkBrown">
                      <div className="absolute inset-0 uyghur-pattern opacity-30" />
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <span className="text-gold/30 font-heading text-4xl font-bold text-center leading-tight">
                          {getTitle(event)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Genre badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-3 py-1 bg-gold/90 text-darkBrown text-xs font-bold rounded-full uppercase tracking-wide backdrop-blur-sm">
                      {t(`genre.${GENRE_KEYS[event.genre as Genre]}`)}
                    </span>
                    <span className="px-2 py-1 bg-darkBrown/70 text-cream text-xs font-bold rounded-full backdrop-blur-sm">
                      {event.ageRestriction}+
                    </span>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                    <h3 className="font-heading font-bold text-xl text-cream leading-tight mb-2 drop-shadow-lg line-clamp-2">
                      {getTitle(event)}
                    </h3>

                    <div className="flex items-center gap-4 text-cream/70 text-sm mb-3">
                      {firstShow && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-gold" />
                          {formatDate(firstShow.dateTime, locale === 'kz' ? 'kk-KZ' : 'ru-KZ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold/60" />
                        {event.duration} мин.
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {minPrice !== null && (
                        <span className="text-gold font-heading font-bold text-lg">
                          {locale === 'ru' ? 'от' : 'бастап'} {formatPrice(minPrice)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-gold text-darkBrown rounded-full text-xs font-bold uppercase tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {locale === 'ru' ? 'Подробнее' : 'Толығырақ'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
