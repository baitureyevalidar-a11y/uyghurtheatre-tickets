import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ---------------------------------------------------------------------------
// Tailwind class merging
// ---------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Price formatting
// ---------------------------------------------------------------------------

/**
 * Formats a numeric amount as a KZT price string.
 * e.g. 15000 → "15 000 ₸"
 * The currency symbol can be overridden via the optional `currency` parameter,
 * but the thousand-separated format is always applied.
 */
export function formatPrice(amount: number, currency: string = 'KZT'): string {
  const symbol = currency === 'KZT' ? '₸' : currency
  const formatted = amount
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') // non-breaking space as separator
  return `${formatted} ${symbol}`
}

// ---------------------------------------------------------------------------
// Date / time formatting (Almaty — UTC+6)
// ---------------------------------------------------------------------------

const ALMATY_TZ = 'Asia/Almaty'

/**
 * Formats a date (no time component) for the Almaty timezone.
 * Default locale is 'ru-KZ' to match the app's primary audience.
 * e.g. 2026-03-26 → "26 марта 2026 г."
 */
export function formatDate(
  date: Date | string,
  locale: string = 'ru-KZ',
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ALMATY_TZ,
  }).format(d)
}

/**
 * Formats a date + time for the Almaty timezone.
 * e.g. 2026-03-26T19:00:00Z → "26 марта 2026 г., 01:00"
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'ru-KZ',
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ALMATY_TZ,
  }).format(d)
}

// ---------------------------------------------------------------------------
// Order number generation
// ---------------------------------------------------------------------------

/**
 * Generates a unique-ish order number in the format "UYT-YYYY-NNNNN".
 * The year is taken from the current date; the suffix is a zero-padded
 * random 5-digit number.
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const suffix = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `UYT-${year}-${suffix}`
}

// ---------------------------------------------------------------------------
// Refund calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the refund amount based on how far in advance the refund is
 * requested relative to the show date.
 *
 * Rules:
 *  - More than 7 days before show  → 100 % refund
 *  - 3–7 days before show          → 70 % refund
 *  - 1–3 days before show          → 50 % refund
 *  - Less than 24 hours            →  0 % refund (no refund)
 */
export function calculateRefundAmount(
  ticketPrice: number,
  showDate: Date,
): number {
  const now = Date.now()
  const msUntilShow = showDate.getTime() - now
  const hoursUntilShow = msUntilShow / (1000 * 60 * 60)

  if (hoursUntilShow < 24) {
    return 0
  }

  const daysUntilShow = hoursUntilShow / 24

  if (daysUntilShow > 7) {
    return ticketPrice * 1.0
  } else if (daysUntilShow >= 3) {
    return ticketPrice * 0.7
  } else {
    // 1–3 days (we already handled <24 h above)
    return ticketPrice * 0.5
  }
}
