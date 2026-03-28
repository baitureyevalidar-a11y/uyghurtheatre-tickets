export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Sparkles, Camera } from 'lucide-react';
import GalleryLightbox from '@/components/ui/gallery-lightbox';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ru' ? 'Фотогалерея' : 'Фотогалерея',
    description: locale === 'ru'
      ? 'Фотографии спектаклей и закулисной жизни Уйгурского театра имени Кужамьярова в Алматы.'
      : 'Күжамиаров атындағы Ұйғыр театрының қойылымдары мен сахна артындағы суреттері.',
    openGraph: {
      title: locale === 'ru' ? 'Фотогалерея | Ұйғыр театры' : 'Фотогалерея | Ұйғыр театры',
    },
  };
}

const galleryImages = [
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-01.jpg', alt: 'Спектакль — сцена 1' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-02.jpg', alt: 'Спектакль — сцена 2' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-03.jpg', alt: 'Спектакль — сцена 3' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-04.jpg', alt: 'Закулисье' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-05.jpg', alt: 'Зрительный зал' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2024/01/photo_2024-01-15_10-30-06.jpg', alt: 'Фойе театра' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/12/photo_2023-12-20_14-22-01.jpg', alt: 'Музыкальная комедия' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/12/photo_2023-12-20_14-22-02.jpg', alt: 'Драматический спектакль' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/12/photo_2023-12-20_14-22-03.jpg', alt: 'Концерт' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/11/photo_2023-11-10_09-15-01.jpg', alt: 'Репетиция' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/11/photo_2023-11-10_09-15-02.jpg', alt: 'Премьера' },
  { src: 'https://uyghurtheatre.kz/wp-content/uploads/2023/11/photo_2023-11-10_09-15-03.jpg', alt: 'Фольклорная постановка' },
];

export default async function GalleryPage() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="relative overflow-hidden bg-darkBrown">
        <div className="absolute inset-0 uyghur-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-darkBrown/80 to-darkBrown" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0"><div className="ornament-border" /></div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-gold mb-6 backdrop-blur-sm">
            <Camera className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'Фото' : 'Фото'}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl lg:text-6xl mb-4">
            <span className="text-shimmer">
              {locale === 'ru' ? 'Фотогалерея' : 'Фотогалерея'}
            </span>
          </h1>
          <p className="text-cream/50 font-body text-sm max-w-md mx-auto">
            {locale === 'ru'
              ? 'Лучшие моменты из жизни нашего театра'
              : 'Театрымыздың өмірінен ең жақсы сәттер'}
          </p>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryLightbox images={galleryImages} />
      </section>
    </div>
  );
}
