'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-darkBrown relative pb-16 md:pb-0">
      {/* Ornamental border */}
      <div className="ornament-border" />

      {/* Uyghur pattern overlay */}
      <div className="absolute inset-0 uyghur-pattern pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Theater info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/50 bg-gold/10 font-heading font-bold text-gold">
                УТ
              </span>
              <div>
                <h3 className="font-heading font-bold text-gold text-lg">Ұйғыр театры</h3>
                <p className="text-cream/40 text-xs">им. К. Кужамьярова</p>
              </div>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed mb-6">
              {locale === 'ru'
                ? 'Единственный в мире профессиональный уйгурский театр. Основан в 1934 году.'
                : locale === 'kz'
                ? 'Әлемдегі жалғыз кәсіби ұйғыр театры. 1934 жылы құрылған.'
                : 'دۇنيادىكى يەگانە كەسپىي ئۇيغۇر تېئاترى. 1934-يىلى قۇرۇلغان.'}
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'YouTube'].map((name) => (
                <a key={name} href="#" className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300">
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              {tFooter('navigation')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: `/${locale}`, label: t('home') },
                { href: `/${locale}/events`, label: t('events') },
                { href: `/${locale}/about`, label: t('about') },
                { href: `/${locale}/refund`, label: tFooter('refund') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-cream/50 hover:text-gold text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              {tFooter('contacts')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" />
                <span className="text-cream/50 text-sm">
                  {locale === 'ru' ? 'г. Алматы, ул. Абылай хана, 62' : 'Алматы қ., Абылай хан к-сі, 62'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold/60 shrink-0" />
                <a href="tel:+77272618161" className="text-cream/50 hover:text-gold text-sm transition-colors">
                  +7 (727) 261-81-61
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold/60 shrink-0" />
                <a href="mailto:info@uyghurtheatre.kz" className="text-cream/50 hover:text-gold text-sm transition-colors">
                  info@uyghurtheatre.kz
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold/60 shrink-0" />
                <span className="text-cream/50 text-sm">10:00 – 19:00</span>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-heading font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              {locale === 'ru' ? 'На карте' : 'Картада'}
            </h4>
            <div className="rounded-xl overflow-hidden border border-gold/20 h-40">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.4!2d76.9453!3d43.2551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE1JzE4LjQiTiA3NsKwNTYnNDMuMSJF!5e0!3m2!1sru!2skz!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Theater location"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider-gold mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-xs">
            © {new Date().getFullYear()} {tFooter('copyright')}
          </p>
          <p className="text-cream/20 text-xs">
            {locale === 'ru' ? 'Уйгурский · Русский · Казахский' : 'Uyghur · Russian · Kazakh'}
          </p>
        </div>
      </div>
    </footer>
  );
}
