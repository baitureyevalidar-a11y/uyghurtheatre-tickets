import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Ұйғыр театры — Алматы',
    template: '%s | Ұйғыр театры',
  },
  description:
    'Қ. Күжамиаров атындағы Мемлекеттік Ұйғыр музыкалық комедия театры — билеттерді онлайн сатып алыңыз.',
  metadataBase: new URL('https://uyghurtheatre.kz'),
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-cream text-brown font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#3D2B1F',
                color: '#F5F0E8',
                borderRadius: '8px',
                border: '1px solid #C9A84C',
              },
            }}
          />
        </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
