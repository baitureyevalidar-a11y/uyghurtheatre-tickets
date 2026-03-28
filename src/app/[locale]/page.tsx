export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/db';
import EventCard from '@/components/events/EventCard';

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
  const nextShowDate = shows[0]?.dateTime ? new Date(shows[0].dateTime).toISOString() : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-darkBrown">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-darkBrown via-burgundy/40 to-darkBrown" />
        {/* Uyghur pattern */}
        <div className="absolute inset-0 uyghur-pattern" />
        {/* Radial glow */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(139,26,26,0.3) 0%, transparent 60%)' }} />

        {/* Curtain decorations */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-burgundy/30 to-transparent hidden lg:block" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-burgundy/30 to-transparent hidden lg:block" />

        {/* Decorative gold lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-gold mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Алматы</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-shimmer">{t('heroTitle')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-cream/60 font-body max-w-xl leading-relaxed mb-10">
              {t('heroSubtitle')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/events`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-darkBrown font-bold rounded-full shadow-gold hover:shadow-gold-lg hover:scale-105 transition-all duration-300 text-sm uppercase tracking-wider"
              >
                {tNav('events')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gold/40 text-gold font-medium rounded-full hover:bg-gold/10 hover:border-gold/60 transition-all duration-300 text-sm uppercase tracking-wider"
              >
                {tNav('about')}
              </Link>
            </div>
          </div>

          {/* Decorative curtain lines right */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 opacity-20">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 rounded-full bg-gold" style={{ height: `${120 - i * 15}px` }} />
            ))}
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="ornament-border" />
        </div>
      </section>

      {/* ── Countdown Section ── */}
      {nextShowDate && (
        <section className="bg-darkBrown/95 border-b border-gold/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <CountdownClient targetDate={nextShowDate} locale={locale} />
          </div>
        </section>
      )}

      {/* ── Upcoming Shows ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 text-gold mb-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{t('upcomingShows')}</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-darkBrown mb-4">
            {t('upcomingShows')}
          </h2>
          <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-burgundy to-gold" />
        </div>

        {shows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(shows as any[]).map((show) => (
                <EventCard key={show.id} show={show} locale={locale} />
              ))}
            </div>

            {shows.length >= 6 && (
              <div className="mt-14 flex justify-center">
                <Link
                  href={`/${locale}/events`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-darkBrown text-gold rounded-full font-medium hover:bg-burgundy transition-colors duration-300 text-sm uppercase tracking-wider"
                >
                  {t('allEvents')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/20 bg-darkBrown/5 py-24 text-center">
            <Calendar className="mb-4 h-12 w-12 text-gold/30" />
            <p className="font-heading text-xl font-semibold text-brown/50">{t('upcomingShows')}</p>
            <p className="mt-2 text-sm text-brown/30">Нет предстоящих мероприятий</p>
          </div>
        )}
      </section>

      {/* ── Stats ── */}
      <section className="bg-darkBrown">
        <div className="ornament-border" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: '1934', label: locale === 'ru' ? 'Год основания' : 'Құрылған жыл', sub: locale === 'ru' ? 'история театра' : 'театр тарихы' },
              { value: '600+', label: locale === 'ru' ? 'Зрительных мест' : 'Көрермен орны', sub: locale === 'ru' ? 'в большом зале' : 'үлкен залда' },
              { value: '90+', label: locale === 'ru' ? 'Лет на сцене' : 'Сахнада жыл', sub: locale === 'ru' ? 'традиции и новаторство' : 'дәстүр мен жаңашылдық' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-8 rounded-2xl border border-gold/10 bg-white/5">
                <p className="font-heading text-5xl font-bold text-gold mb-2">{stat.value}</p>
                <p className="text-sm font-semibold text-cream/80">{stat.label}</p>
                <p className="text-xs text-cream/40 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* Client component for countdown */
function CountdownClient({ targetDate, locale }: { targetDate: string; locale: string }) {
  // This is a server component file, so we render a client wrapper
  // The countdown is rendered client-side via a script
  return (
    <div className="text-center">
      <p className="text-gold/60 text-xs font-bold uppercase tracking-[0.2em] mb-6">
        {locale === 'ru' ? 'До ближайшего спектакля' : 'Жақын қойылымға дейін'}
      </p>
      <div className="flex items-center justify-center gap-3" suppressHydrationWarning>
        <CountdownTimer targetDate={targetDate} />
      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  // Static render - client-side JS will hydrate
  const diff = new Date(targetDate).getTime() - Date.now();
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000));

  const units = [
    { value: days, label: 'дн' },
    { value: hours, label: 'час' },
    { value: minutes, label: 'мин' },
  ];

  return (
    <>
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3">
          <div className="flip-card">
            <div className="flip-card-inner w-16 h-20 sm:w-20 sm:h-24 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-heading font-bold text-gold">
                {String(u.value).padStart(2, '0')}
              </span>
              <span className="text-cream/40 text-[10px] uppercase tracking-wider mt-1">{u.label}</span>
            </div>
          </div>
          {i < units.length - 1 && <span className="text-gold/30 text-2xl font-light">:</span>}
        </div>
      ))}
    </>
  );
}
