'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDate, formatPrice, cn } from '@/lib/utils';

interface EventCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  show: any;
  locale: string;
  className?: string;
}

const GENRE_LABELS: Record<string, string> = {
  COMEDY: 'Комедия',
  DRAMA: 'Драма',
  MUSICAL: 'Мюзикл',
  CONCERT: 'Концерт',
  CHILDREN: 'Детский',
  FOLKLORE: 'Фольклор',
  OTHER: 'Другое',
};

export default function EventCard({ show, locale, className }: EventCardProps) {
  const event = show.event;
  const title = locale === 'ru' ? event.titleRu : locale === 'kz' ? event.titleKz : event.titleUy;
  const minPrice = show.priceTiers?.[0]?.price ? Number(show.priceTiers[0].price) : null;
  const genre = GENRE_LABELS[event.genre] || event.genre;

  return (
    <Link
      href={`/${locale}/events/${event.id}`}
      className={cn('card-theatrical group block h-80 sm:h-96', className)}
    >
      {/* Poster / gradient placeholder */}
      {event.posterImage ? (
        <Image
          src={event.posterImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-burgundy-dark to-darkBrown">
          <div className="absolute inset-0 uyghur-pattern opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <span className="text-gold/30 font-heading text-4xl font-bold text-center leading-tight">
              {title}
            </span>
          </div>
        </div>
      )}

      {/* Genre badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 bg-gold/90 text-darkBrown text-xs font-bold rounded-full uppercase tracking-wide backdrop-blur-sm">
          {genre}
        </span>
      </div>

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <h3 className="font-heading font-bold text-xl text-cream leading-tight mb-2 drop-shadow-lg">
          {title}
        </h3>

        <div className="flex items-center gap-2 text-cream/70 text-sm mb-3">
          <Calendar className="w-4 h-4 text-gold" />
          <span>{formatDate(show.dateTime, locale)}</span>
        </div>

        <div className="flex items-center justify-between">
          {minPrice && (
            <span className="text-gold font-heading font-bold text-lg">
              от {formatPrice(minPrice)}
            </span>
          )}

          {/* Hover-reveal button */}
          <span className="flex items-center gap-1.5 px-4 py-2 bg-gold text-darkBrown rounded-full text-xs font-bold uppercase tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Подробнее
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
