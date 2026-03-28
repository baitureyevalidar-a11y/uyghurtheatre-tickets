export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { MapPin, Phone, Clock, Mail, Sparkles, Calendar, Users, Award, ExternalLink } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ru' ? 'О театре' : 'Театр туралы',
    description: locale === 'ru'
      ? 'Уйгурский театр имени Кужамьярова — единственный в мире профессиональный уйгурский театр, основан в 1934 году в Алматы.'
      : 'Күжамиаров атындағы Ұйғыр театры — әлемдегі жалғыз кәсіби ұйғыр театры, 1934 жылы Алматыда құрылған.',
    openGraph: {
      title: locale === 'ru' ? 'О театре | Ұйғыр театры' : 'Театр туралы | Ұйғыр театры',
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  const milestones = locale === 'ru'
    ? [
        { year: '1934', text: 'Основан Уйгурский театр в Алма-Ате как первый профессиональный уйгурский театр в мире' },
        { year: '1943', text: 'Театру присвоено имя выдающегося уйгурского композитора Кужамьярова' },
        { year: '1961', text: 'Театр получает статус академического' },
        { year: '2000-е', text: 'Активное обновление репертуара, постановка современных произведений' },
        { year: '2024', text: 'Юбилейный 90-й сезон. Более 300 постановок за всю историю' },
      ]
    : [
        { year: '1934', text: 'Алматыда әлемдегі алғашқы кәсіби ұйғыр театры ретінде құрылды' },
        { year: '1943', text: 'Театрға көрнекті ұйғыр композиторы Күжамиаровтың аты берілді' },
        { year: '1961', text: 'Театр академиялық мәртебе алды' },
        { year: '2000-ж', text: 'Репертуарды белсенді жаңарту, заманауи шығармалар қою' },
        { year: '2024', text: 'Мерейтойлық 90-маусым. Барлық тарихта 300-ден астам қойылым' },
      ];

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-darkBrown">
        <div className="absolute inset-0 uyghur-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-darkBrown/80 to-darkBrown" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0"><div className="ornament-border" /></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-gold mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'С 1934 года' : '1934 жылдан'}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl mb-4">
            <span className="text-shimmer">{t('about')}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-cream/50 font-body">
            Қ. Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры
          </p>
        </div>
      </section>

      {/* ── Quick Stats ── */}
      <section className="mx-auto max-w-7xl px-4 -mt-8 relative z-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Calendar, value: '1934', label: locale === 'ru' ? 'Год основания' : 'Құрылған жыл' },
            { icon: Award, value: '92', label: locale === 'ru' ? 'Сезон' : 'Маусым' },
            { icon: Users, value: '50 000+', label: locale === 'ru' ? 'Зрителей/год' : 'Көрермен/жыл' },
            { icon: Sparkles, value: '300+', label: locale === 'ru' ? 'Спектаклей' : 'Қойылымдар' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gold/20 shadow-card text-center">
                <Icon className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="font-heading text-2xl font-bold text-darkBrown">{stat.value}</p>
                <p className="text-brown/50 text-xs mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── History ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="font-heading text-3xl font-bold text-darkBrown mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full bg-gradient-to-b from-gold to-burgundy" />
              {locale === 'ru' ? 'История театра' : 'Театр тарихы'}
            </h2>
            <div className="prose prose-brown font-body space-y-4 text-brown/80">
              <p>
                {locale === 'ru'
                  ? 'Государственный республиканский академический Уйгурский театр музыкальной комедии имени Кужамьярова — единственный в мире профессиональный уйгурский театр. Основан в 1934 году в Алма-Ате.'
                  : 'Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры — әлемдегі жалғыз кәсіби ұйғыр театры. 1934 жылы Алматыда құрылған.'}
              </p>
              <p>
                {locale === 'ru'
                  ? 'За более чем 90 лет истории театр поставил сотни спектаклей, включая классические и современные произведения уйгурской, казахской и мировой драматургии. Театр является хранителем уникальной уйгурской культуры и традиций музыкального искусства.'
                  : '90 жылдан астам тарихында театр ұйғыр, қазақ және әлем драматургиясының классикалық және заманауи шығармаларын қоса алғанда, жүздеген қойылымдар қойды.'}
              </p>
              <p>
                {locale === 'ru'
                  ? 'В репертуаре театра — музыкальные комедии, драмы, фольклорные постановки, детские спектакли и концертные программы. Труппа регулярно гастролирует по Казахстану и за рубежом.'
                  : 'Театр репертуарында — музыкалық комедиялар, драмалар, фольклорлық қойылымдар, балалар қойылымдары және концерттік бағдарламалар.'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <h3 className="font-heading text-lg font-bold text-darkBrown mb-6">
              {locale === 'ru' ? 'Ключевые даты' : 'Маңызды күндер'}
            </h3>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gold border-2 border-gold/50 shrink-0" />
                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-gold/20 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">{m.year}</span>
                    <p className="text-brown/70 text-sm mt-1">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contacts ── */}
      <section className="bg-darkBrown">
        <div className="ornament-border" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">
              <span className="text-shimmer">{locale === 'ru' ? 'Контакты' : 'Байланыс'}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">
                    {locale === 'ru' ? 'Адрес' : 'Мекенжай'}
                  </p>
                  <p className="text-cream/60 text-sm mt-1">
                    {locale === 'ru' ? 'г. Алматы, ул. Наурызбай батыра, 83' : 'Алматы қ., Наурызбай батыр к-сі, 83'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">
                    {locale === 'ru' ? 'Телефон' : 'Телефон'}
                  </p>
                  <a href="tel:+77272725933" className="text-cream/60 hover:text-gold text-sm transition-colors block mt-1">
                    +7 (727) 272-59-33
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">WhatsApp</p>
                  <a href="https://wa.me/77019491936" className="text-cream/60 hover:text-gold text-sm transition-colors block mt-1">
                    +7 (701) 949-19-36
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">Email</p>
                  <a href="mailto:uyghurtheatrekz@gmail.com" className="text-cream/60 hover:text-gold text-sm transition-colors block mt-1">
                    uyghurtheatrekz@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-gold/10 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-cream text-sm">
                    {locale === 'ru' ? 'Касса' : 'Касса'}
                  </p>
                  <p className="text-cream/60 text-sm mt-1">
                    {locale === 'ru' ? 'Пн — Вс: 10:00 — 19:00' : 'Дс — Жс: 10:00 — 19:00'}
                  </p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  { name: 'Instagram', href: 'https://instagram.com/uyghurtheatrekz' },
                  { name: 'Facebook', href: 'https://facebook.com/uyghurtheatrekz' },
                  { name: 'YouTube', href: 'https://youtube.com/@uyghurtheatrekz' },
                  { name: 'TikTok', href: 'https://tiktok.com/@uyghurtheatrekz' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 text-cream/50 hover:text-gold hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 text-xs font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Google Maps */}
            <div className="rounded-2xl overflow-hidden border border-gold/20 h-[400px] lg:h-full min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2906.5!2d76.9355!3d43.2567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38836eb14f010a0b%3A0x5f1b0a4596e04c4a!2z0KPQudCz0YPRgNGB0LrQuNC5INGC0LXQsNGC0YAg0LzRg9C30YvQutCw0LvRjNC90L7QuSDQutC-0LzQtdC00LjQuA!5e0!3m2!1sru!2skz!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Уйгурский театр на карте"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
