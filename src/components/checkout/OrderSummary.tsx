'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { cn, formatPrice, formatDateTime } from '@/lib/utils'

interface SeatItem {
  id: string
  row: number
  seatNumber: number
  sectorName: string
  price: number
}

interface OrderSummaryProps {
  eventTitle: string
  eventPoster?: string
  dateTime: string
  hallName: string
  seats: SeatItem[]
  timerSeconds?: number
  className?: string
}

export default function OrderSummary({
  eventTitle,
  eventPoster,
  dateTime,
  hallName,
  seats,
  timerSeconds,
  className,
}: OrderSummaryProps) {
  const t = useTranslations()
  const [timeLeft, setTimeLeft] = useState(timerSeconds ?? 0)

  useEffect(() => {
    if (!timerSeconds) return
    setTimeLeft(timerSeconds)
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerSeconds])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const total = seats.reduce((sum, s) => sum + s.price, 0)
  const isUrgent = timeLeft > 0 && timeLeft < 120

  return (
    <div className={cn('rounded-xl border border-brown/15 bg-white shadow-sm overflow-hidden', className)}>
      {/* Event poster + info */}
      <div className="relative bg-burgundy/5 p-4 border-b border-brown/10">
        <div className="flex gap-3 items-start">
          {eventPoster ? (
            <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0 shadow">
              <Image src={eventPoster} alt={eventTitle} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-20 rounded-md bg-burgundy/20 flex-shrink-0 flex items-center justify-center">
              <span className="text-burgundy text-2xl">🎭</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-darkBrown text-sm leading-snug line-clamp-2">
              {eventTitle}
            </h3>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-brown/70">
                <Calendar className="w-3.5 h-3.5 text-burgundy flex-shrink-0" />
                <span className="truncate">{formatDateTime(dateTime)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brown/70">
                <MapPin className="w-3.5 h-3.5 text-burgundy flex-shrink-0" />
                <span className="truncate">{hallName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer */}
      {timerSeconds !== undefined && timerSeconds > 0 && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b border-brown/10',
            isUrgent
              ? 'bg-red-50 text-red-700'
              : 'bg-amber-50 text-amber-800',
          )}
        >
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {t('seats.timerWarning', {
              minutes: String(minutes).padStart(2, '0'),
            })}
          </span>
          <span className={cn('ml-auto font-mono font-bold tabular-nums', isUrgent && 'text-red-600')}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Seats list */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-brown/60 uppercase tracking-wide mb-2">
          {t('seats.selected')} ({seats.length})
        </p>
        {seats.map((seat) => (
          <div key={seat.id} className="flex items-center justify-between text-sm">
            <span className="text-brown/80">
              {t('seats.row')} {seat.row},{' '}
              {t('seats.seat')} {seat.seatNumber}
              {seat.sectorName && (
                <span className="text-brown/50 ml-1">({seat.sectorName})</span>
              )}
            </span>
            <span className="font-semibold text-brown whitespace-nowrap ml-2">
              {formatPrice(seat.price)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-brown/10 bg-cream/50 flex items-center justify-between">
        <span className="font-semibold text-darkBrown">{t('seats.total')}</span>
        <span className="font-heading font-bold text-lg text-burgundy">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  )
}
