export const dynamic = 'force-dynamic';

import { getTranslations, getLocale } from 'next-intl/server';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

export default async function AboutPage() {
  const t = await getTranslations('nav');
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-darkBrown">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-cream sm:text-5xl">
            {t('about')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/70 font-body">
            Қ. Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* History */}
          <div>
            <h2 className="font-heading text-2xl font-bold text-burgundy mb-4">
              {locale === 'ru' ? 'История театра' : locale === 'kz' ? 'Театр тарихы' : 'تېئاتر تارىخى'}
            </h2>
            <div className="prose prose-brown font-body space-y-4 text-brown/80">
              <p>
                {locale === 'ru'
                  ? 'Государственный республиканский академический Уйгурский театр музыкальной комедии имени Кужамьярова — единственный в мире профессиональный уйгурский театр. Основан в 1934 году в Алма-Ате.'
                  : locale === 'kz'
                  ? 'Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры — әлемдегі жалғыз кәсіби ұйғыр театры. 1934 жылы Алматыда құрылған.'
                  : 'كۈجامياروف نامىدىكى دۆلەتلىك رېسپۇبلىكالىق ئاكادېمىيىلىك ئۇيغۇر مۇزىكىلىق كومىدىيە تېئاترى — دۇنيادىكى يەگانە كەسپىي ئۇيغۇر تېئاترى. 1934-يىلى ئالمىئاتادا قۇرۇلغان.'}
              </p>
              <p>
                {locale === 'ru'
                  ? 'За более чем 90 лет истории театр поставил сотни спектаклей, включая классические и современные произведения уйгурской, казахской и мировой драматургии.'
                  : locale === 'kz'
                  ? '90 жылдан астам тарихында театр ұйғыр, қазақ және әлем драматургиясының классикалық және заманауи шығармаларын қоса алғанда, жүздеген қойылымдар қойды.'
                  : '90 يىلدىن ئارتۇق تارىخىدا تېئاتر يۈزلىگەن سەھنە ئەسەرلىرىنى سەھنىلەشتۈردى.'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-burgundy mb-4">
              {locale === 'ru' ? 'Контакты' : locale === 'kz' ? 'Байланыс' : 'ئالاقە'}
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gold/20">
                <MapPin className="w-5 h-5 text-burgundy mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-brown">
                    {locale === 'ru' ? 'Адрес' : locale === 'kz' ? 'Мекенжай' : 'ئادرېس'}
                  </p>
                  <p className="text-brown/70 text-sm">
                    {locale === 'ru'
                      ? 'г. Алматы, ул. Абылай хана, 62'
                      : locale === 'kz'
                      ? 'Алматы қ., Абылай хан к-сі, 62'
                      : 'ئالمىئاتا شەھىرى، ئابىلاي خان كوچىسى، 62'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gold/20">
                <Phone className="w-5 h-5 text-burgundy mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-brown">
                    {locale === 'ru' ? 'Телефон' : locale === 'kz' ? 'Телефон' : 'تېلېفون'}
                  </p>
                  <p className="text-brown/70 text-sm">+7 (727) 261-81-61</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gold/20">
                <Mail className="w-5 h-5 text-burgundy mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-brown">Email</p>
                  <p className="text-brown/70 text-sm">info@uyghurtheatre.kz</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gold/20">
                <Clock className="w-5 h-5 text-burgundy mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-brown">
                    {locale === 'ru' ? 'Режим работы кассы' : locale === 'kz' ? 'Касса жұмыс уақыты' : 'كاسسا ۋاقتى'}
                  </p>
                  <p className="text-brown/70 text-sm">10:00 – 19:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
