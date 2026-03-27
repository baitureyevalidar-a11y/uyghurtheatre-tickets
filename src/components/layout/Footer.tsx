import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-darkBrown text-cream/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy text-cream font-heading font-bold text-base shadow-md">
                УТ
              </span>
              <div>
                <p className="font-heading font-semibold text-cream text-lg leading-tight">
                  Уйгурский театр
                </p>
                <p className="text-xs text-gold/80 font-body">им. Кунайхан Кужамьярова</p>
              </div>
            </div>
            <p className="text-sm font-body leading-relaxed text-cream/60 max-w-xs">
              Государственный академический уйгурский театр музыкальной комедии —
              один из старейших национальных театров Казахстана.
            </p>

            {/* Social media */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3 font-body">
                {t('socialMedia')}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 text-cream/60 hover:border-gold/50 hover:text-gold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 text-cream/60 hover:border-gold/50 hover:text-gold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 text-cream/60 hover:border-gold/50 hover:text-gold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-4 font-body">
              {tNav('home')}
            </p>
            <ul className="space-y-2 font-body text-sm">
              {[
                { href: `/${locale}`, label: tNav('home') },
                { href: `/${locale}/events`, label: tNav('events') },
                { href: `/${locale}/about`, label: tNav('about') },
                { href: `/${locale}/contacts`, label: tNav('contacts') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-4 font-body">
              {tNav('contacts')}
            </p>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-2.5 text-cream/60">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold/60" />
                <span>{t('address')}</span>
              </li>
              <li>
                <a
                  href="tel:+77272729372"
                  className="flex items-center gap-2.5 text-cream/60 hover:text-gold transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold/60" />
                  <span>+7 (727) 272-93-72</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@uyghurtheatre.kz"
                  className="flex items-center gap-2.5 text-cream/60 hover:text-gold transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold/60" />
                  <span>info@uyghurtheatre.kz</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-cream/40">
            {t('rights', { year })}
          </p>
          <div className="flex items-center gap-4 text-xs font-body text-cream/40">
            <Link href={`/${locale}/privacy`} className="hover:text-cream/70 transition-colors">
              Политика конфиденциальности
            </Link>
            <span>·</span>
            <Link href={`/${locale}/terms`} className="hover:text-cream/70 transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
