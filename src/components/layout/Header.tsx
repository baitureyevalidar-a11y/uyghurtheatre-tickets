'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, ChevronDown, User, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  uy: 'UY',
  ru: 'RU',
  kz: 'KZ',
};

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Placeholder cart count — replace with real cart state
  const cartCount = 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const switchLocale = (nextLocale: string) => {
    // Replace the current locale segment in the pathname
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/events`, label: t('events') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-md shadow-md border-b border-gold/20'
          : 'bg-cream border-b border-gold/10',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 group shrink-0"
          aria-label="Uyghur Theatre — Home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-cream font-heading font-bold text-sm shadow group-hover:bg-burgundy/90 transition-colors">
            УТ
          </span>
          <span className="hidden sm:block font-heading font-semibold text-burgundy text-lg leading-tight">
            Уйгурский театр
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium font-body transition-colors',
                pathname === link.href
                  ? 'text-burgundy bg-burgundy/8'
                  : 'text-brown hover:text-burgundy hover:bg-burgundy/5',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold font-body',
                'text-brown hover:text-burgundy hover:bg-burgundy/5 transition-colors',
                langOpen && 'bg-burgundy/5 text-burgundy',
              )}
              aria-label={t('language')}
              aria-expanded={langOpen}
            >
              {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
              <ChevronDown
                className={cn('h-3 w-3 transition-transform', langOpen && 'rotate-180')}
              />
            </button>

            {langOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[72px] rounded-md border border-gold/20 bg-cream shadow-lg overflow-hidden">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-xs font-semibold font-body transition-colors',
                        loc === locale
                          ? 'bg-burgundy text-cream'
                          : 'text-brown hover:bg-burgundy/5 hover:text-burgundy',
                      )}
                    >
                      {LOCALE_LABELS[loc]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart */}
          <Link
            href={`/${locale}/cart`}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-brown hover:text-burgundy hover:bg-burgundy/5 transition-colors"
            aria-label={t('cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-cream text-[10px] font-bold leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Login / Profile — desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <Link href={`/${locale}/tickets`} aria-label={t('myTickets')}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Ticket className="h-4 w-4" />
                <span className="hidden lg:inline">{t('myTickets')}</span>
              </Button>
            </Link>
            <Link href={`/${locale}/auth/login`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                <span>{t('login')}</span>
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-brown hover:text-burgundy hover:bg-burgundy/5 transition-colors md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/15 bg-cream/98 backdrop-blur-sm animate-slideDown">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium font-body transition-colors',
                  pathname === link.href
                    ? 'text-burgundy bg-burgundy/8 font-semibold'
                    : 'text-brown hover:text-burgundy hover:bg-burgundy/5',
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 pt-2 border-t border-gold/15 flex flex-col gap-1">
              <Link
                href={`/${locale}/tickets`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium font-body text-brown hover:text-burgundy hover:bg-burgundy/5 transition-colors"
              >
                <Ticket className="h-4 w-4" />
                {t('myTickets')}
              </Link>
              <Link href={`/${locale}/auth/login`}>
                <Button variant="default" size="sm" className="w-full mt-1 gap-2">
                  <User className="h-4 w-4" />
                  {t('login')}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
