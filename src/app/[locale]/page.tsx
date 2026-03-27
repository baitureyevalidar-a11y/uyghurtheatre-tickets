export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';

async function getUpcomingShows() {
  try {
    return await prisma.show.findMany({
      where: {
        status: 'ON_SALE',
        dateTime: { gt: new Date() },
      },
      include: {
        event: true,
        hall: true,
        priceTiers: true,
      },
      orderBy: { dateTime: 'asc' },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const locale = await getLocale();

  const shows = await getUpcomingShows();

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-darkBrown">
        {/* Background texture / gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkBrown via-burgundy/80 to-darkBrown" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            {/* Decorative label */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-gold">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold font-body uppercase tracking-widest">
                Алматы
              </span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-cream/70 font-body max-w-xl">
              {t('heroSubtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={`/${locale}/events`}>
                <Button variant="gold" size="lg" className="gap-2 shadow-lg shadow-gold/20">
                  {tNav('events')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream hover:border-cream/50"
                >
                  {tNav('about')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative curtain lines */}
          <div className="absolute right-0 top-0 hidden h-full w-64 lg:block">
            <div className="flex h-full justify-end gap-2 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-full w-3 rounded-b-full bg-gold"
                  style={{
                    transform: `scaleY(${0.85 + i * 0.03}) translateY(${i % 2 === 0 ? '-4px' : '4px'})`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Shows Section ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Section header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-semibold font-body uppercase tracking-widest">
                {t('upcomingShows')}
              </span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-burgundy sm:text-4xl">
              {t('upcomingShows')}
            </h2>
            {/* Gold underline accent */}
            <div className="mt-2 h-0.5 w-16 rounded-full bg-gold" />
          </div>

          <Link href={`/${locale}/events`}>
            <Button variant="outline" size="md" className="gap-2 shrink-0">
              {t('allEvents')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <EventFilters locale={locale} />
        </div>

        {/* Events grid */}
        {shows.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(shows as any[]).map((show) => (
              <EventCard key={show.id} show={show} locale={locale} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-cream/50 py-24 text-center">
            <Calendar className="mb-4 h-12 w-12 text-gold/40" />
            <p className="font-heading text-xl font-semibold text-brown/60">
              {t('upcomingShows')}
            </p>
            <p className="mt-2 text-sm text-brown/40 font-body">
              Нет предстоящих мероприятий
            </p>
          </div>
        )}

        {/* View all CTA */}
        {shows.length >= 6 && (
          <div className="mt-12 flex justify-center">
            <Link href={`/${locale}/events`}>
              <Button variant="default" size="lg" className="gap-2 px-8">
                {t('allEvents')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* ── Theater Info Banner ── */}
      <section className="border-t border-gold/15 bg-darkBrown/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { label: 'Основан', value: '1934', sub: 'год основания' },
              { label: 'Зрителей', value: '600+', sub: 'мест в зале' },
              { label: 'Премьеры', value: '2+', sub: 'каждый сезон' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-4xl font-bold text-burgundy">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-brown font-body">{stat.label}</p>
                <p className="text-xs text-brown/50 font-body">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
