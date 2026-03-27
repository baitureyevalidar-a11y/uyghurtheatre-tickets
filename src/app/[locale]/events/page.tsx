export const dynamic = 'force-dynamic';

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate, formatPrice, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { routing } from '@/i18n/routing'
import { CalendarDays, Clock, Users } from 'lucide-react'

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

  const events = await prisma.event.findMany({
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

  type EventItem = (typeof events)[number]

  // Localised title helper
  function getTitle(event: EventItem) {
    if (locale === 'ru') return event.titleRu
    if (locale === 'kz') return event.titleKz
    return event.titleUy
  }

  const pageTitle =
    locale === 'ru' ? 'Афиша' : locale === 'kz' ? 'Афиша' : 'تەدبىرلەر'

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="border-b border-gold/20 bg-darkBrown">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-cream sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mt-2 text-cream/60 font-body text-sm">
            {tHome('upcomingShows')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Genre filter */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-brown mr-1">
            {tHome('filterByGenre')}:
          </span>
          <Link
            href={`/${locale}/events`}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border',
              !genreFilter
                ? 'bg-burgundy text-cream border-burgundy'
                : 'bg-white text-brown border-brown/20 hover:border-burgundy hover:text-burgundy',
            )}
          >
            {tCommon('noResults').startsWith('Н') ? 'Все' : 'Барлығы'}
          </Link>
          {ALL_GENRES.map((g) => (
            <Link
              key={g}
              href={`/${locale}/events?genre=${g}`}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border',
                genreFilter === g
                  ? 'bg-burgundy text-cream border-burgundy'
                  : 'bg-white text-brown border-brown/20 hover:border-burgundy hover:text-burgundy',
              )}
            >
              {t(`genre.${GENRE_KEYS[g]}`)}
            </Link>
          ))}
        </div>

        {/* Events grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-brown/15 bg-white py-20 text-center">
            <p className="font-heading text-xl text-brown/50">{tCommon('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event: EventItem) => {
              const firstShow = event.shows[0] ?? null
              const minPrice = firstShow?.priceTiers[0]?.price
                ? Number(firstShow.priceTiers[0].price)
                : null

              return (
                <Link
                  key={event.id}
                  href={`/${locale}/events/${event.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-brown/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gold/40"
                >
                  {/* Poster */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-darkBrown/10">
                    {event.posterImage ? (
                      <Image
                        src={event.posterImage}
                        alt={getTitle(event)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-4xl text-brown/20">УТ</span>
                      </div>
                    )}
                    {/* Genre badge overlay */}
                    <div className="absolute left-3 top-3">
                      <Badge variant="default" size="sm">
                        {t(`genre.${GENRE_KEYS[event.genre as Genre]}`)}
                      </Badge>
                    </div>
                    {/* Age restriction */}
                    <div className="absolute right-3 top-3">
                      <span className="rounded bg-darkBrown/80 px-1.5 py-0.5 text-[10px] font-bold text-cream">
                        {event.ageRestriction}+
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="font-heading text-base font-semibold leading-snug text-darkBrown line-clamp-2 group-hover:text-burgundy transition-colors">
                      {getTitle(event)}
                    </h2>

                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-brown/60">
                      {firstShow && (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-burgundy/60" />
                          <span>{formatDate(firstShow.dateTime, locale === 'kz' ? 'kk-KZ' : locale === 'uy' ? 'ru-KZ' : 'ru-KZ')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-burgundy/60" />
                        <span>
                          {event.duration} {locale === 'ru' ? 'мин.' : locale === 'kz' ? 'мин.' : 'مىنۇت'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      {minPrice !== null ? (
                        <span className="text-sm font-semibold text-burgundy">
                          {locale === 'ru' ? 'от ' : locale === 'kz' ? 'бастап ' : ''}
                          {formatPrice(minPrice)}
                        </span>
                      ) : (
                        <span className="text-xs text-brown/40">—</span>
                      )}
                      <span className="rounded-full bg-burgundy/8 px-3 py-1 text-xs font-semibold text-burgundy">
                        {locale === 'ru'
                          ? 'Купить'
                          : locale === 'kz'
                          ? 'Сатып алу'
                          : 'سېتىۋېلىش'}
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
