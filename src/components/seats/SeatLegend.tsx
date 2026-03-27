'use client'

import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface SectorLegendItem {
  id: string
  name: string
  color: string
  minPrice: number
  maxPrice: number
}

interface SeatLegendProps {
  sectors: SectorLegendItem[]
  className?: string
}

const STATUS_ITEMS = [
  {
    label: 'Свободно',
    className: 'bg-white border-2 border-brown/30',
  },
  {
    label: 'Выбрано',
    className: 'bg-gold border-2 border-gold',
  },
  {
    label: 'Занято',
    className: 'bg-brown/25 border-2 border-brown/20',
  },
]

export default function SeatLegend({ sectors, className }: SeatLegendProps) {
  return (
    <div className={cn('rounded-xl border border-brown/15 bg-white p-4 shadow-sm', className)}>
      <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-darkBrown">
        Легенда
      </h3>

      {/* Sectors */}
      {sectors.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brown/50">Секторы</p>
          {sectors.map((sector) => (
            <div key={sector.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 flex-shrink-0 rounded-full border border-white/60 shadow-sm"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-sm text-brown">{sector.name}</span>
              </div>
              <span className="text-xs text-brown/60">
                {sector.minPrice === sector.maxPrice
                  ? formatPrice(sector.minPrice)
                  : `${formatPrice(sector.minPrice)} – ${formatPrice(sector.maxPrice)}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="mb-3 border-t border-brown/10" />

      {/* Status colors */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-brown/50">Статус</p>
        {STATUS_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={cn('h-4 w-4 flex-shrink-0 rounded-full', item.className)} />
            <span className="text-sm text-brown">{item.label}</span>
          </div>
        ))}
        {/* VIP indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-gold bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          <span className="text-sm text-brown">VIP место</span>
        </div>
      </div>
    </div>
  )
}
