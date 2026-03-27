'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatPrice } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceTier {
  id: string;
  price: number | { toNumber(): number };
  currency: string;
  seatType: string;
}

interface Hall {
  id: string;
  name: string;
}

interface Event {
  id: string;
  titleKz: string;
  titleRu: string;
  titleUy: string;
  posterImage: string;
  genre: string;
  ageRestriction: string;
  duration: number;
}

interface Show {
  id: string;
  dateTime: Date | string;
  event: Event;
  hall: Hall;
  priceTiers: PriceTier[];
}

interface EventCardProps {
  show: Show;
  locale: string;
  className?: string;
}

// ─── Genre label map ───────────────────────────────────────────────────────────

const GENRE_KEYS: Record<string, string> = {
  COMEDY: 'comedy',
  DRAMA: 'drama',
  MUSICAL: 'musical',
  CONCERT: 'concert',
  CHILDREN: 'children',
  FOLKLORE: 'folklore',
  OTHER: 'other',
};

const GENRE_COLORS: Record<string, string> = {
  COMEDY: 'bg-amber-100 text-amber-800 border-amber-200',
  DRAMA: 'bg-purple-100 text-purple-800 border-purple-200',
  MUSICAL: 'bg-pink-100 text-pink-800 border-pink-200',
  CONCERT: 'bg-blue-100 text-blue-800 border-blue-200',
  CHILDREN: 'bg-green-100 text-green-800 border-green-200',
  FOLKLORE: 'bg-orange-100 text-orange-800 border-orange-200',
  OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocalizedTitle(event: Event, locale: string): string {
  if (locale === 'kz') return event.titleKz;
  if (locale === 'ru') return event.titleRu;
  return event.titleUy;
}

function getMinPrice(tiers: PriceTier[]): number | null {
  if (!tiers || tiers.length === 0) return null;
  return Math.min(
    ...tiers.map((t) =>
      typeof t.price === 'object' && 'toNumber' in t.price ? t.price.toNumber() : Number(t.price),
    ),
  );
}

function getIntlLocale(locale: string): string {
  if (locale === 'ru') return 'ru-KZ';
  if (locale === 'kz') return 'kk-KZ';
  return 'ug';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventCard({ show, locale, className }: EventCardProps) {
  const t = useTranslations('event');
  const tHome = useTranslations('home');

  const { event, hall, priceTiers, dateTime } = show;

  const title = getLocalizedTitle(event, locale);
  const minPrice = getMinPrice(priceTiers);
  const intlLocale = getIntlLocale(locale);
  const genreKey = GENRE_KEYS[event.genre] ?? 'other';
  const genreColor = GENRE_COLORS[event.genre] ?? GENRE_COLORS.OTHER;

  const formattedDate = formatDate(dateTime, intlLocale);
  const showDate = new Date(dateTime);
  const formattedTime = showDate.toLocaleTimeString(intlLocale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Almaty',
  });

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-gold/15 bg-white',
        'shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg hover:shadow-burgundy/10 hover:border-gold/30',
        'animate-slideUp',
        className,
      )}
    >
      {/* Poster image */}
      <Link
        href={`/${locale}/events/${event.id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-darkBrown/10 sm:aspect-[4/3]"
        tabIndex={-1}
        aria-hidden="true"
      >
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder when no poster */
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-burgundy/20 to-darkBrown/30">
            <span className="font-heading text-4xl font-bold text-cream/30">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-darkBrown/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Age restriction badge — top right */}
        <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-darkBrown/80 text-[10px] font-bold text-cream font-body backdrop-blur-sm">
          {event.ageRestriction}
        </span>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Genre badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold font-body',
              genreColor,
            )}
          >
            {t(`genre.${genreKey}`)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/${locale}/events/${event.id}`} className="group/title">
          <h3 className="font-heading text-lg font-semibold leading-snug text-brown line-clamp-2 group-hover/title:text-burgundy transition-colors">
            {title}
          </h3>
        </Link>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5 text-sm font-body text-brown/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span>{formattedDate}</span>
            <span className="text-brown/30">·</span>
            <Clock className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span className="truncate">{hall.name}</span>
            {event.duration > 0 && (
              <>
                <span className="text-brown/30">·</span>
                <span>{event.duration} мин</span>
              </>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
          <div className="flex flex-col">
            {minPrice !== null ? (
              <>
                <span className="text-[11px] font-body text-brown/50 uppercase tracking-wide">
                  {tHome('priceFrom')}
                </span>
                <span className="font-heading text-lg font-bold text-burgundy leading-none">
                  {formatPrice(minPrice)}
                </span>
              </>
            ) : (
              <span className="text-sm font-body text-brown/50">—</span>
            )}
          </div>

          <Link href={`/${locale}/shows/${show.id}/seats`}>
            <Button variant="default" size="sm" className="shrink-0">
              {tHome('buyTicket')}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
