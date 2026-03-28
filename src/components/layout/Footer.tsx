'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-darkBrown relative pb-16 md:pb-0">
      <div className="ornament-border" />
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
                : 'Әлемдегі жалғыз кәсіби ұйғыр театры. 1934 жылы құрылған.'}
            </p>
            {/* Social links */}
            <div className="flex gap-2">
              {[
                { name: 'IG', href: 'https://instagram.com/uyghurtheatrekz', hoverBg: 'hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-400/40' },
                { name: 'FB', href: 'https://facebook.com/uyghurtheatrekz', hoverBg: 'hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-400/40' },
                { name: 'YT', href: 'https://youtube.com/@uyghurtheatrekz', hoverBg: 'hover:bg-red-500/20 hover:text-red-400 hover:border-red-400/40' },
                { name: 'TT', href: 'https://tiktok.com/@uyghurtheatrekz', hoverBg: 'hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-400/40' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-cream/40 text-xs font-bold transition-all duration-300 ${s.hoverBg}`}
                >
                  {s.name}
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
                { href: `/${locale}/gallery`, label: locale === 'ru' ? 'Галерея' : 'Галерея' },
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

          {/* Contact + hours */}
          <div>
            <h4 className="font-heading font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              {tFooter('contacts')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" />
                <span className="text-cream/50 text-sm">
                  {locale === 'ru' ? 'г. Алматы, ул. Наурызбай батыра, 83' : 'Алматы қ., Наурызбай батыр к-сі, 83'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold/60 shrink-0" />
                <a href="tel:+77272725933" className="text-cream/50 hover:text-gold text-sm transition-colors">
                  +7 (727) 272-59-33
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold/60 shrink-0" />
                <a href="mailto:uyghurtheatrekz@gmail.com" className="text-cream/50 hover:text-gold text-sm transition-colors">
                  uyghurtheatrekz@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold/60 shrink-0" />
                <span className="text-cream/50 text-sm">
                  {locale === 'ru' ? 'Касса: Пн — Вс 10:00 — 19:00' : 'Касса: Дс — Жс 10:00 — 19:00'}
                </span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-gold/70 text-xs font-semibold uppercase tracking-wider mb-2">
                {locale === 'ru' ? 'Подписка на новости' : 'Жаңалықтарға жазылу'}
              </p>
              {subscribed ? (
                <p className="text-green-400 text-sm">
                  {locale === 'ru' ? 'Спасибо за подписку!' : 'Жазылғаныңызға рахмет!'}
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="flex-1 px-3 py-2 bg-white/5 border border-gold/15 rounded-lg text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-gold/40 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-gold/20 border border-gold/30 rounded-lg text-gold hover:bg-gold/30 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-heading font-semibold text-gold mb-4 text-sm uppercase tracking-wider">
              {locale === 'ru' ? 'На карте' : 'Картада'}
            </h4>
            <div className="rounded-xl overflow-hidden border border-gold/20 h-44">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9355!3d43.2567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38836eb14f010a0b%3A0x5f1b0a4596e04c4a!2z0KPQudCz0YPRgNGB0LrQuNC5INGC0LXQsNGC0YAg0LzRg9C30YvQutCw0LvRjNC90L7QuSDQutC-0LzQtdC00LjQuA!5e0!3m2!1sru!2skz!4v1"
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
