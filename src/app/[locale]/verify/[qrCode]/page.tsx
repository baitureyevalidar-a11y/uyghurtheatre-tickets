export const dynamic = 'force-dynamic';

import prisma from '@/lib/db'
import { verifyTicketQR } from '@/lib/qr'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Props {
  params: Promise<{ qrCode: string; locale: string }>
}

export default async function VerifyPage({ params }: Props) {
  const { qrCode } = await params

  const decoded = verifyTicketQR(decodeURIComponent(qrCode))

  if (!decoded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-red-600 mb-2">Недействительный билет</h1>
          <p className="text-brown/60">QR-код поврежден или недействителен</p>
        </div>
      </div>
    )
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: decoded.ticketId },
    include: {
      show: { include: { event: true, hall: true } },
      seat: { include: { sector: true } },
      order: true,
    },
  })

  if (!ticket) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-red-600 mb-2">Билет не найден</h1>
          <p className="text-brown/60">Билет с таким QR-кодом не найден в системе</p>
        </div>
      </div>
    )
  }

  const statusConfig = {
    PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Действителен', desc: 'Билет оплачен и действителен' },
    USED: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Уже использован', desc: `Вход отмечен: ${ticket.usedAt ? formatDateTime(ticket.usedAt) : ''}` },
    RESERVED: { icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Забронирован', desc: 'Билет забронирован, но не оплачен' },
    REFUNDED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Возврат', desc: 'Билет возвращён' },
    CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Отменён', desc: 'Билет отменён' },
    EXPIRED: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Истёк', desc: 'Срок действия истёк' },
  }

  const status = statusConfig[ticket.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`${status.bg} p-6 text-center`}>
          <StatusIcon className={`w-16 h-16 ${status.color} mx-auto mb-3`} />
          <h1 className={`text-2xl font-heading font-bold ${status.color}`}>{status.label}</h1>
          <p className={`text-sm ${status.color} opacity-75 mt-1`}>{status.desc}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-brown/50 uppercase tracking-wide">Спектакль</p>
            <p className="text-lg font-heading font-bold text-darkBrown">{ticket.show.event.titleRu}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-brown/50">Дата и время</p>
              <p className="font-medium text-brown">{formatDateTime(ticket.show.dateTime)}</p>
            </div>
            <div>
              <p className="text-sm text-brown/50">Зал</p>
              <p className="font-medium text-brown">{ticket.show.hall.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-brown/50">Сектор</p>
              <p className="font-medium text-brown">{ticket.seat.sector.name}</p>
            </div>
            <div>
              <p className="text-sm text-brown/50">Ряд</p>
              <p className="font-medium text-brown">{ticket.seat.row}</p>
            </div>
            <div>
              <p className="text-sm text-brown/50">Место</p>
              <p className="font-medium text-brown">{ticket.seat.seatNumber}</p>
            </div>
          </div>

          <div className="border-t border-brown/10 pt-4">
            <p className="text-sm text-brown/50">Заказ №{ticket.order.orderNumber}</p>
            <p className="text-sm text-brown/50">Покупатель: {ticket.order.customerName}</p>
          </div>

          {ticket.status === 'PAID' && (
            <form action={`/api/tickets/${ticket.id}/checkin`} method="POST">
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                ✓ Отметить вход
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
