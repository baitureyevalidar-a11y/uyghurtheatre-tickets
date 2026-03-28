'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, ShoppingCart, Ticket, LogIn, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/events`, label: t('events') },
    { href: `/${locale}/gallery`, label: locale === 'ru' ? 'Галерея' : 'Галерея' },
    { href: `/${locale}/about`, label: t('about') },
  ];

  const switchLocale = (newLocale: string) => {
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(path);
  };

  const transparent = isHome && !scrolled;

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        transparent
          ? 'bg-transparent'
          : 'bg-darkBrown/95 backdrop-blur-lg border-b border-gold/20 shadow-lg shadow-black/20',
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 group shrink-0">
              <span className="flex h-10 w-10 items-center justify-center rounded-full font-heading font-bold text-sm border-2 bg-gold/20 border-gold/50 text-gold group-hover:bg-gold/30 transition-all duration-300">
                УТ
              </span>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-lg leading-tight text-cream">Ұйғыр театры</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-gold/60">Алматы</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors group',
                    active ? 'text-gold' : 'text-cream/70 hover:text-gold',
                  )}>
                    {link.label}
                    <span className={cn(
                      'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold rounded-full transition-all duration-300',
                      active ? 'w-6' : 'w-0 group-hover:w-6',
                    )} />
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center border border-gold/20 rounded-full overflow-hidden">
                {['uy', 'ru', 'kz'].map((l) => (
                  <button key={l} onClick={() => switchLocale(l)} className={cn(
                    'px-2.5 py-1 text-[10px] font-bold uppercase transition-all',
                    locale === l ? 'bg-gold text-darkBrown' : 'text-cream/50 hover:text-gold',
                  )}>{l}</button>
                ))}
              </div>

              <Link href={`/${locale}/cart`} className="p-2 rounded-lg text-cream/60 hover:text-gold transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/tickets`} className="hidden sm:block p-2 rounded-lg text-cream/60 hover:text-gold transition-colors">
                <Ticket className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/auth/login`} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-all">
                <LogIn className="w-3.5 h-3.5" />
                {t('login')}
              </Link>
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-cream">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {!isHome && <div className="h-16" />}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-darkBrown border-l border-gold/20 animate-slideInRight" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gold/20">
              <span className="font-heading font-bold text-gold">Меню</span>
              <button onClick={() => setMobileOpen(false)} className="text-cream/60 hover:text-cream p-1"><X className="w-5 h-5" /></button>
            </div>
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname === link.href ? 'bg-burgundy/30 text-gold' : 'text-cream/70 hover:bg-white/5 hover:text-cream',
                )}>{link.label}</Link>
              ))}
              <div className="divider-gold my-4" />
              <Link href={`/${locale}/tickets`} className="flex items-center gap-3 px-4 py-3 text-cream/70 hover:text-gold transition-colors rounded-xl">
                <Ticket className="w-4 h-4" /><span className="text-sm">{t('myTickets')}</span>
              </Link>
              <Link href={`/${locale}/auth/login`} className="flex items-center gap-3 px-4 py-3 text-cream/70 hover:text-gold transition-colors rounded-xl">
                <LogIn className="w-4 h-4" /><span className="text-sm">{t('login')}</span>
              </Link>
              <div className="divider-gold my-4" />
              <div className="flex items-center gap-2 px-4 py-2">
                <Globe className="w-4 h-4 text-cream/40" />
                {['uy', 'ru', 'kz'].map((l) => (
                  <button key={l} onClick={() => switchLocale(l)} className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all',
                    locale === l ? 'bg-gold text-darkBrown' : 'text-cream/50 hover:text-gold',
                  )}>{l}</button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
