'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-burgundy mb-8">
          {locale === 'ru' ? 'Корзина' : locale === 'kz' ? 'Себет' : 'سېۋەت'}
        </h1>

        <div className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-cream/50 py-24 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-gold/40" />
          <p className="font-heading text-xl font-semibold text-brown/60">
            {locale === 'ru' ? 'Корзина пуста' : locale === 'kz' ? 'Себет бос' : 'سېۋەت بوش'}
          </p>
          <p className="mt-2 text-sm text-brown/40">
            {locale === 'ru'
              ? 'Выберите места на странице мероприятия'
              : locale === 'kz'
              ? 'Іс-шара бетінен орындарды таңдаңыз'
              : 'تەدبىر بېتىدىن ئورۇنلارنى تاللاڭ'}
          </p>
          <a href={`/${locale}/events`} className="mt-4 text-burgundy hover:underline text-sm">
            {locale === 'ru' ? 'Перейти к афише' : locale === 'kz' ? 'Афишаға өту' : 'ئافىشاغا ئۆتۈش'}
          </a>
        </div>
      </div>
    </div>
  );
}
