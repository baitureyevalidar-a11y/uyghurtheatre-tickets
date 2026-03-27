'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, Download, Loader2, Mail, Ticket } from 'lucide-react'
import QRCode from 'qrcode'
import { cn, formatPrice, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface TicketData {
  id: string
  qrCode: string
  status: string
  seat: {
    row: number
    seatNumber: number
    sector: { name: string; color: string }
  }
  show: {
    dateTime: string
    event: { titleRu: string; titleKz: string; titleUy: string; posterImage?: string }
    hall: { name: string }
  }
}

interface OrderData {
  id: string
  orderNumber: string
  totalAmount: number
  paymentMethod: string
  customerName: string
  customerEmail?: string
  tickets: TicketData[]
}

// Simple CSS confetti via animated dots
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => i)
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#C9A84C', '#6B1D2A', '#F5F0E8', '#3D2B1F', '#e44c65'][i % 5],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

function TicketCard({ ticket, orderNumber }: { ticket: TicketData; orderNumber: string }) {
  const t = useTranslations()
  const locale = useLocale()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ticket.qrCode) {
      QRCode.toDataURL(ticket.qrCode, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 200,
        color: { dark: '#3D2B1F', light: '#ffffff' },
      }).then(setQrDataUrl).catch(() => {})
    }
  }, [ticket.qrCode])

  const eventTitle = locale === 'kz'
    ? ticket.show.event.titleKz
    : locale === 'uy'
    ? ticket.show.event.titleUy
    : ticket.show.event.titleRu

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `ticket-${orderNumber}-row${ticket.seat.row}-seat${ticket.seat.seatNumber}.png`
    link.click()
  }

  return (
    <div className="rounded-xl border border-brown/15 bg-white shadow overflow-hidden">
      {/* Ticket header strip */}
      <div
        className="h-2"
        style={{ backgroundColor: ticket.seat.sector.color ?? '#6B1D2A' }}
      />
      <div className="p-4">
        <div className="flex gap-4 items-start">
          {/* QR Code */}
          <div className="flex-shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 rounded-lg border border-brown/10" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-brown/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-brown/40" />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-heading font-semibold text-darkBrown text-sm leading-snug line-clamp-2">
              {eventTitle}
            </h3>
            <p className="text-xs text-brown/60">{formatDateTime(ticket.show.dateTime)}</p>
            <p className="text-xs text-brown/60">{ticket.show.hall.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-burgundy/10 px-2.5 py-0.5 text-xs font-semibold text-burgundy">
                <Ticket className="w-3 h-3" />
                {t('seats.row')} {ticket.seat.row}, {t('seats.seat')} {ticket.seat.seatNumber}
              </span>
              <span className="text-xs text-brown/50">{ticket.seat.sector.name}</span>
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="my-3 border-t border-dashed border-brown/20" />

        {/* Download button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleDownload}
          disabled={!qrDataUrl}
        >
          <Download className="w-4 h-4" />
          {t('tickets.download')} PDF
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const orderNumberParam = searchParams.get('orderNumber') ?? ''

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((json) => setOrder(json.data ?? json))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    )
  }

  const displayOrderNumber = order?.orderNumber ?? orderNumberParam

  return (
    <div className="min-h-screen bg-cream">
      {showConfetti && <Confetti />}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confettiFall linear forwards;
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-darkBrown mb-2">
            Спасибо за покупку!
          </h1>
          <p className="text-brown/70 font-body">Рахмет! Билеты успешно оформлены.</p>
        </div>

        {/* Order number banner */}
        {displayOrderNumber && (
          <Card className="mb-6 border-gold/30 bg-gold/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-brown/60 font-body">{t('tickets.orderNumber')}</p>
                <p className="font-mono font-bold text-lg text-darkBrown">{displayOrderNumber}</p>
              </div>
              {order && (
                <div className="text-right">
                  <p className="text-xs text-brown/60">Итого</p>
                  <p className="font-heading font-bold text-burgundy text-lg">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Email notice */}
        {order?.customerEmail && (
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 mb-6">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Билеты отправлены на{' '}
              <span className="font-semibold">{order.customerEmail}</span>
            </p>
          </div>
        )}

        {/* Tickets */}
        {order?.tickets && order.tickets.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="font-heading text-xl font-semibold text-darkBrown">Ваши билеты</h2>
            {order.tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                orderNumber={displayOrderNumber}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1" size="lg">
            <Link href="/profile">{t('tickets.myTickets')}</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/">{t('nav.home')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
