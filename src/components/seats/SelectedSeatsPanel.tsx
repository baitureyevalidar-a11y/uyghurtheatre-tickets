'use client'

import { X, Clock, ShoppingCart, AlertCircle } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface SelectedSeat {
  id: string
  row: number
  seatNumber: number
  sectorName: string
  sectorColor: string
  price: number
  seatType: string
}

interface SelectedSeatsPanelProps {
  selectedSeats: SelectedSeat[]
  showId: string
  secondsLeft: number | null
  onRemoveSeat: (seatId: string) => void
  className?: string
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function SelectedSeatsPanel({
  selectedSeats,
  showId,
  secondsLeft,
  onRemoveSeat,
  className,
}: SelectedSeatsPanelProps) {
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)
  const seatIds = selectedSeats.map((s) => s.id).join(',')
  const checkoutHref = `/checkout?showId=${showId}&seats=${seatIds}`

  const timerDanger = secondsLeft !== null && secondsLeft <= 120

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-brown/15 bg-white shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brown/10 px-4 py-3">
        <h3 className="flex items-center gap-2 font-heading text-sm font-semibold text-darkBrown">
          <ShoppingCart className="h-4 w-4 text-burgundy" />
          Выбрано мест: {selectedSeats.length}
        </h3>

        {/* Timer */}
        {secondsLeft !== null && (
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              timerDanger
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-amber-50 text-amber-700',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatCountdown(secondsLeft)}
          </div>
        )}
      </div>

      {/* Timer warning */}
      {secondsLeft !== null && timerDanger && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Ваши места будут освобождены через{' '}
            <strong>{Math.ceil(secondsLeft / 60)} минут</strong>
          </span>
        </div>
      )}

      {/* Seats list */}
      <div className="flex-1 overflow-y-auto">
        {selectedSeats.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-brown/50">
            Нажмите на свободное место, чтобы выбрать
          </p>
        ) : (
          <ul className="divide-y divide-brown/8">
            {selectedSeats.map((seat) => (
              <li
                key={seat.id}
                className="flex items-center justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-cream/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full border border-white/60 shadow-sm"
                    style={{ backgroundColor: seat.sectorColor }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-darkBrown">
                      {seat.sectorName}
                    </p>
                    <p className="text-xs text-brown/60">
                      Ряд {seat.row}, Место {seat.seatNumber}
                      {seat.seatType === 'VIP' && (
                        <span className="ml-1 rounded-sm bg-gold/20 px-1 text-[10px] font-semibold text-gold">
                          VIP
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-burgundy">
                    {formatPrice(seat.price)}
                  </span>
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    aria-label={`Убрать место ряд ${seat.row}, место ${seat.seatNumber}`}
                    className="rounded p-0.5 text-brown/40 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer — total + checkout */}
      {selectedSeats.length > 0 && (
        <div className="border-t border-brown/10 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-brown">Итого:</span>
            <span className="font-heading text-lg font-bold text-darkBrown">
              {formatPrice(total)}
            </span>
          </div>
          <Button asChild variant="gold" size="lg" className="w-full">
            <Link href={checkoutHref}>
              <ShoppingCart className="h-4 w-4" />
              Перейти к оплате
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
