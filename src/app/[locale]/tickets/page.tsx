export const dynamic = 'force-dynamic';

import { getTranslations, getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Ticket, QrCode, Calendar } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';

export default async function TicketsPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('tickets');

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  let tickets: Array<{
    id: string;
    qrCode: string;
    status: string;
    price: number;
    show: { dateTime: Date; event: { titleRu: string; titleKz: string; titleUy: string } };
    seat: { row: number; number: number; sector: { name: string } };
  }> = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickets = await prisma.ticket.findMany({
      where: {
        order: { userId: session.user.id, status: 'PAID' },
      },
      include: {
        show: { include: { event: true } },
        seat: { include: { sector: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;
  } catch {
    // DB not ready
  }

  const getTitle = (event: { titleRu: string; titleKz: string; titleUy: string }) => {
    if (locale === 'ru') return event.titleRu;
    if (locale === 'kz') return event.titleKz;
    return event.titleUy;
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-burgundy mb-8">
          {t('myTickets')}
        </h1>

        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-gold/20 p-6 flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-lg text-darkBrown">
                    {getTitle(ticket.show.event)}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-brown/70">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(ticket.show.dateTime, locale)}</span>
                  </div>
                  <p className="text-sm text-brown/70 mt-1">
                    {ticket.seat.sector.name} · {locale === 'ru' ? 'Ряд' : 'Қатар'} {ticket.seat.row}, {locale === 'ru' ? 'Место' : 'Орын'} {ticket.seat.number}
                  </p>
                  <p className="text-sm font-medium text-burgundy mt-1">
                    {formatPrice(ticket.price)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'USED' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status}
                  </div>
                  <a
                    href={`/${locale}/verify/${ticket.qrCode}`}
                    className="text-burgundy hover:underline text-xs flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    QR
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-cream/50 py-24 text-center">
            <Ticket className="mb-4 h-12 w-12 text-gold/40" />
            <p className="font-heading text-xl font-semibold text-brown/60">
              {locale === 'ru' ? 'У вас пока нет билетов' : locale === 'kz' ? 'Сізде әлі билеттер жоқ' : 'سىزدە تېخى بىلەت يوق'}
            </p>
            <a href={`/${locale}/events`} className="mt-4 text-burgundy hover:underline text-sm">
              {locale === 'ru' ? 'Перейти к афише' : locale === 'kz' ? 'Афишаға өту' : 'ئافىشاغا ئۆتۈش'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
