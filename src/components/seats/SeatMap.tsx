'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import SeatTooltip from './SeatTooltip'
import SeatLegend from './SeatLegend'
import SelectedSeatsPanel, { type SelectedSeat } from './SelectedSeatsPanel'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeatData {
  id: string
  row: number
  seatNumber: number
  x: number
  y: number
  seatType: 'REGULAR' | 'VIP' | 'WHEELCHAIR' | 'RESTRICTED_VIEW'
  sector: {
    id: string
    name: string
    color: string
  }
  availability: 'available' | 'reserved' | 'occupied'
}

export interface PriceTierData {
  id: string
  sectorId: string
  seatType: string
  price: number
  currency: string
  sector: {
    id: string
    name: string
    color: string
  }
}

interface TooltipState {
  visible: boolean
  row: number
  seatNumber: number
  sectorName: string
  price: number
  x: number
  y: number
}

interface SeatMapProps {
  seats: SeatData[]
  priceTiers: PriceTierData[]
  showId: string
}

const TIMER_SECONDS = 15 * 60 // 15 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeatPrice(
  seat: SeatData,
  priceTiers: PriceTierData[],
): number {
  // Find matching price tier: same sector + same seat type (fall back to same sector any type)
  const exact = priceTiers.find(
    (t) => t.sectorId === seat.sector.id && t.seatType === seat.seatType,
  )
  if (exact) return exact.price

  const sectorOnly = priceTiers.find((t) => t.sectorId === seat.sector.id)
  return sectorOnly?.price ?? 0
}

function buildSectorLegend(
  seats: SeatData[],
  priceTiers: PriceTierData[],
) {
  const map = new Map<string, { id: string; name: string; color: string; prices: number[] }>()

  for (const seat of seats) {
    if (!map.has(seat.sector.id)) {
      map.set(seat.sector.id, {
        id: seat.sector.id,
        name: seat.sector.name,
        color: seat.sector.color,
        prices: [],
      })
    }
  }

  for (const tier of priceTiers) {
    const entry = map.get(tier.sectorId)
    if (entry) entry.prices.push(tier.price)
  }

  return Array.from(map.values()).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    minPrice: s.prices.length ? Math.min(...s.prices) : 0,
    maxPrice: s.prices.length ? Math.max(...s.prices) : 0,
  }))
}

// ---------------------------------------------------------------------------
// SeatCircle sub-component
// ---------------------------------------------------------------------------

interface SeatCircleProps {
  seat: SeatData
  isSelected: boolean
  price: number
  onToggle: (seat: SeatData, price: number) => void
  onHover: (seat: SeatData, price: number, clientX: number, clientY: number) => void
  onLeave: () => void
}

function SeatCircle({ seat, isSelected, price, onToggle, onHover, onLeave }: SeatCircleProps) {
  const isOccupied = seat.availability === 'occupied' || seat.availability === 'reserved'
  const isVip = seat.seatType === 'VIP'

  // Colours
  let fill: string
  let stroke: string
  let strokeWidth = 1

  if (isOccupied) {
    fill = '#B0A090'
    stroke = '#9A8A78'
  } else if (isSelected) {
    fill = '#C9A84C'
    stroke = '#A8873A'
    strokeWidth = 2
  } else {
    // Available — use sector colour at ~80% opacity
    fill = seat.sector.color + 'CC'
    stroke = seat.sector.color
  }

  if (isVip && !isOccupied) {
    stroke = '#C9A84C'
    strokeWidth = isSelected ? 2 : 1.5
  }

  const radius = isVip ? 7 : 6

  return (
    <circle
      cx={seat.x}
      cy={seat.y}
      r={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={{ cursor: isOccupied ? 'not-allowed' : 'pointer' }}
      onClick={() => {
        if (!isOccupied) onToggle(seat, price)
      }}
      onMouseEnter={(e) => {
        if (!isOccupied) onHover(seat, price, e.clientX, e.clientY)
      }}
      onMouseMove={(e) => {
        if (!isOccupied) onHover(seat, price, e.clientX, e.clientY)
      }}
      onMouseLeave={onLeave}
      aria-label={`Ряд ${seat.row}, Место ${seat.seatNumber}${isOccupied ? ' (занято)' : ''}`}
      role="button"
      tabIndex={isOccupied ? -1 : 0}
      onKeyDown={(e) => {
        if (!isOccupied && (e.key === 'Enter' || e.key === ' ')) {
          onToggle(seat, price)
        }
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Main SeatMap component
// ---------------------------------------------------------------------------

export default function SeatMap({ seats, priceTiers, showId }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    row: 0,
    seatNumber: 0,
    sectorName: '',
    price: 0,
    x: 0,
    y: 0,
  })

  // Timer
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Touch / zoom
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const lastTouchDist = useRef<number | null>(null)
  const lastTouchMid = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const lastDragPos = useRef<{ x: number; y: number } | null>(null)

  // Start / reset timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSecondsLeft(TIMER_SECONDS)
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSecondsLeft(null)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // When secondsLeft reaches 0 and timer was running — clear selections
  useEffect(() => {
    if (secondsLeft === 0) {
      setSelectedSeats([])
      stopTimer()
    }
  }, [secondsLeft, stopTimer])

  // Toggle seat selection
  const handleToggleSeat = useCallback(
    (seat: SeatData, price: number) => {
      setSelectedSeats((prev) => {
        const exists = prev.find((s) => s.id === seat.id)
        let next: SelectedSeat[]
        if (exists) {
          next = prev.filter((s) => s.id !== seat.id)
        } else {
          next = [
            ...prev,
            {
              id: seat.id,
              row: seat.row,
              seatNumber: seat.seatNumber,
              sectorName: seat.sector.name,
              sectorColor: seat.sector.color,
              price,
              seatType: seat.seatType,
            },
          ]
        }
        if (next.length === 0) {
          stopTimer()
        } else if (prev.length === 0 && next.length > 0) {
          startTimer()
        }
        return next
      })
    },
    [startTimer, stopTimer],
  )

  const handleRemoveSeat = useCallback(
    (seatId: string) => {
      setSelectedSeats((prev) => {
        const next = prev.filter((s) => s.id !== seatId)
        if (next.length === 0) stopTimer()
        return next
      })
    },
    [stopTimer],
  )

  // Tooltip handlers
  const handleHover = useCallback(
    (seat: SeatData, price: number, clientX: number, clientY: number) => {
      setTooltip({
        visible: true,
        row: seat.row,
        seatNumber: seat.seatNumber,
        sectorName: seat.sector.name,
        price,
        x: clientX,
        y: clientY,
      })
    },
    [],
  )
  const handleLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }, [])

  // Touch zoom (pinch)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastTouchDist.current = Math.hypot(dx, dy)
      lastTouchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    } else if (e.touches.length === 1) {
      isDragging.current = true
      lastDragPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const delta = dist / lastTouchDist.current
      setScale((s) => Math.min(4, Math.max(0.5, s * delta)))
      lastTouchDist.current = dist
    } else if (e.touches.length === 1 && isDragging.current && lastDragPos.current) {
      const dx = e.touches[0].clientX - lastDragPos.current.x
      const dy = e.touches[0].clientY - lastDragPos.current.y
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }))
      lastDragPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null
    lastTouchMid.current = null
    isDragging.current = false
    lastDragPos.current = null
  }, [])

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((s) => Math.min(4, Math.max(0.5, s * delta)))
  }, [])

  const selectedIds = new Set(selectedSeats.map((s) => s.id))
  const sectorLegend = buildSectorLegend(seats, priceTiers)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      {/* SVG map area */}
      <div className="flex-1 min-w-0">
        {/* Stage label */}
        <div className="mb-2 flex items-center justify-center">
          <div className="rounded-t-full bg-burgundy/10 border border-burgundy/20 px-8 py-1 text-xs font-semibold uppercase tracking-widest text-burgundy">
            Сцена
          </div>
        </div>

        {/* Zoomable SVG container */}
        <div
          ref={svgContainerRef}
          className={cn(
            'relative w-full overflow-hidden rounded-xl border border-brown/15 bg-white shadow-sm',
            'touch-none select-none',
          )}
          style={{ aspectRatio: '4 / 3' }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg
            viewBox="0 0 800 600"
            width="100%"
            height="100%"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.05s ease-out',
            }}
          >
            {/* Stage */}
            <rect
              x={200}
              y={20}
              width={400}
              height={50}
              rx={8}
              fill="#6B1D2A"
              opacity={0.15}
              stroke="#6B1D2A"
              strokeWidth={1}
            />
            <text
              x={400}
              y={50}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6B1D2A"
              fontSize={13}
              fontWeight="600"
              fontFamily="var(--font-heading, serif)"
            >
              СЦЕНА
            </text>

            {/* Seats */}
            {seats.map((seat) => {
              const price = getSeatPrice(seat, priceTiers)
              return (
                <SeatCircle
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedIds.has(seat.id)}
                  price={price}
                  onToggle={handleToggleSeat}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              )
            })}
          </svg>

          {/* Zoom hint */}
          <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-darkBrown/60 px-2 py-1 text-[10px] text-cream/80">
            Прокрутите для увеличения
          </div>
        </div>

        {/* Zoom controls */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(4, s * 1.2))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brown/20 bg-white text-brown shadow-sm hover:border-gold hover:text-gold transition-colors"
            aria-label="Увеличить"
          >
            +
          </button>
          <button
            onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }) }}
            className="rounded border border-brown/20 bg-white px-3 py-1 text-xs text-brown shadow-sm hover:border-gold hover:text-gold transition-colors"
            aria-label="Сбросить масштаб"
          >
            Сбросить
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.5, s / 1.2))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brown/20 bg-white text-brown shadow-sm hover:border-gold hover:text-gold transition-colors"
            aria-label="Уменьшить"
          >
            −
          </button>
        </div>

        {/* Legend — shown below map on mobile */}
        <div className="mt-4 lg:hidden">
          <SeatLegend sectors={sectorLegend} />
        </div>
      </div>

      {/* Right sidebar */}
      <div className="flex w-full flex-col gap-4 lg:w-80 lg:flex-shrink-0">
        {/* Legend — desktop */}
        <div className="hidden lg:block">
          <SeatLegend sectors={sectorLegend} />
        </div>

        {/* Selected seats panel */}
        <SelectedSeatsPanel
          selectedSeats={selectedSeats}
          showId={showId}
          secondsLeft={secondsLeft}
          onRemoveSeat={handleRemoveSeat}
        />
      </div>

      {/* Tooltip (portal-style, fixed) */}
      {tooltip.visible && (
        <SeatTooltip
          row={tooltip.row}
          seatNumber={tooltip.seatNumber}
          sectorName={tooltip.sectorName}
          price={tooltip.price}
          x={tooltip.x}
          y={tooltip.y}
          visible={tooltip.visible}
        />
      )}
    </div>
  )
}
