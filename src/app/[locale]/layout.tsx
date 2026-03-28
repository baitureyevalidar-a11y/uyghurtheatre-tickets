import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/whatsapp-button';
import BottomNav from '@/components/ui/bottom-nav';
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
    <html lang={locale} className="scroll-smooth">
      <body className="bg-cream text-brown font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <WhatsAppButton />
            <BottomNav />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1A1A1A',
                  color: '#F5F0E8',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.2)',
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
