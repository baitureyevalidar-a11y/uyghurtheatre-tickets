'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventFiltersProps {
  locale: string;
  className?: string;
}

const GENRES = [
  'ALL',
  'COMEDY',
  'DRAMA',
  'MUSICAL',
  'CONCERT',
  'CHILDREN',
  'FOLKLORE',
  'OTHER',
] as const;

type Genre = (typeof GENRES)[number];

const GENRE_TRANSLATION_KEYS: Record<Genre, string | null> = {
  ALL: null,
  COMEDY: 'comedy',
  DRAMA: 'drama',
  MUSICAL: 'musical',
  CONCERT: 'concert',
  CHILDREN: 'children',
  FOLKLORE: 'folklore',
  OTHER: 'other',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventFilters({ locale, className }: EventFiltersProps) {
  const t = useTranslations('event');
  const tHome = useTranslations('home');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local filter state
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [genre, setGenre] = useState<Genre>((searchParams.get('genre') as Genre) ?? 'ALL');
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') ?? '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') ?? '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    search !== '' ||
    genre !== 'ALL' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    priceMax !== '';

  // Push updated query params to URL
  const applyFilters = useCallback(
    (overrides?: Partial<{ search: string; genre: Genre; dateFrom: string; dateTo: string; priceMax: string }>) => {
      const merged = {
        search,
        genre,
        dateFrom,
        dateTo,
        priceMax,
        ...overrides,
      };

      const params = new URLSearchParams();
      if (merged.search) params.set('q', merged.search);
      if (merged.genre && merged.genre !== 'ALL') params.set('genre', merged.genre);
      if (merged.dateFrom) params.set('from', merged.dateFrom);
      if (merged.dateTo) params.set('to', merged.dateTo);
      if (merged.priceMax) params.set('priceMax', merged.priceMax);

      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [search, genre, dateFrom, dateTo, priceMax, pathname, router],
  );

  const clearAll = () => {
    setSearch('');
    setGenre('ALL');
    setDateFrom('');
    setDateTo('');
    setPriceMax('');
    router.push(pathname, { scroll: false });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Top bar: search + toggle ── */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters({ search });
            }}
            placeholder={tHome('filterByGenre')}
            className={cn(
              'h-10 w-full rounded-lg border border-brown/20 bg-white pl-9 pr-4 text-sm font-body text-brown',
              'placeholder:text-brown/40',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 focus:border-gold',
              'hover:border-brown/40',
            )}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); applyFilters({ search: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant={filtersOpen || hasActiveFilters ? 'default' : 'outline'}
          size="md"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="gap-2 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Фильтры</span>
          {hasActiveFilters && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold text-darkBrown text-[10px] font-bold leading-none">
              !
            </span>
          )}
        </Button>

        {/* Apply search */}
        <Button
          variant="default"
          size="md"
          onClick={() => applyFilters()}
          className="shrink-0"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Найти</span>
        </Button>
      </div>

      {/* ── Genre pills ── */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => {
          const key = GENRE_TRANSLATION_KEYS[g];
          const label = key ? t(`genre.${key}`) : 'Все жанры';
          const isActive = genre === g;
          return (
            <button
              key={g}
              onClick={() => {
                setGenre(g);
                applyFilters({ genre: g });
              }}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold font-body transition-all duration-200',
                isActive
                  ? 'bg-burgundy border-burgundy text-cream shadow-sm'
                  : 'bg-white border-brown/20 text-brown hover:border-burgundy/40 hover:text-burgundy hover:bg-burgundy/5',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Expanded filters panel ── */}
      {filtersOpen && (
        <div className="animate-slideDown rounded-xl border border-gold/15 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date from */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brown font-body uppercase tracking-wide">
                {tHome('filterByDate')} (от)
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border border-brown/20 bg-white px-3 text-sm font-body text-brown',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 focus:border-gold',
                  'hover:border-brown/40',
                )}
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brown font-body uppercase tracking-wide">
                {tHome('filterByDate')} (до)
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border border-brown/20 bg-white px-3 text-sm font-body text-brown',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 focus:border-gold',
                  'hover:border-brown/40',
                )}
              />
            </div>

            {/* Max price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-brown font-body uppercase tracking-wide">
                {tHome('priceFrom')} (макс, ₸)
              </label>
              <input
                type="number"
                value={priceMax}
                min={0}
                step={500}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="10 000"
                className={cn(
                  'h-10 w-full rounded-lg border border-brown/20 bg-white px-3 text-sm font-body text-brown',
                  'placeholder:text-brown/40',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1 focus:border-gold',
                  'hover:border-brown/40',
                )}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col justify-end gap-2">
              <Button variant="default" size="md" onClick={() => applyFilters()} className="w-full">
                Применить
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="md" onClick={clearAll} className="w-full gap-1.5">
                  <X className="h-3.5 w-3.5" />
                  Сбросить
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
