'use client'

import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface SeatTooltipProps {
  row: number
  seatNumber: number
  sectorName: string
  price: number
  x: number
  y: number
  visible: boolean
}

export default function SeatTooltip({
  row,
  seatNumber,
  sectorName,
  price,
  x,
  y,
  visible,
}: SeatTooltipProps) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left: x + 12,
        top: y - 8,
        pointerEvents: 'none',
        zIndex: 50,
      }}
      className={cn(
        'rounded-lg border border-gold/40 bg-darkBrown px-3 py-2 shadow-xl',
        'font-body text-cream text-sm leading-tight',
        'transition-opacity duration-150',
        visible ? 'opacity-100 animate-fadeIn' : 'opacity-0',
      )}
    >
      <p className="font-semibold text-gold">{sectorName}</p>
      <p className="mt-0.5 text-cream/80">
        Ряд {row}, Место {seatNumber}
      </p>
      <p className="mt-1 font-semibold text-gold">{formatPrice(price)}</p>
    </div>
  )
}
