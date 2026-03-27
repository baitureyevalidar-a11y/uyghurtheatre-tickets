'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import OrderSummary from '@/components/checkout/OrderSummary'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector'

interface SeatInfo {
  id: string
  row: number
  seatNumber: number
  sectorName: string
  price: number
}

interface ShowDetails {
  id: string
  dateTime: string
  event: { titleRu: string; titleKz: string; titleUy: string; posterImage?: string }
  hall: { name: string }
}

const TIMER_SECONDS = 15 * 60

export default function CheckoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()

  const showId = searchParams.get('showId') ?? ''
  const seatIdsParam = searchParams.get('seats') ?? ''
  const seatIds = seatIdsParam ? seatIdsParam.split(',').filter(Boolean) : []

  const [show, setShow] = useState<ShowDetails | null>(null)
  const [seats, setSeats] = useState<SeatInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'' | 'KASPI' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CASH'>('')
  const [agreed, setAgreed] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(TIMER_SECONDS)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (timerSeconds <= 0) return
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          toast.error('Время резервации истекло')
          router.back()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router, timerSeconds])

  const fetchData = useCallback(async () => {
    if (!showId || seatIds.length === 0) {
      setFetchError('Некорректные параметры заказа')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [showRes, seatsRes] = await Promise.all([
        fetch(`/api/shows/${showId}`),
        fetch(`/api/shows/${showId}/seats`),
      ])
      if (!showRes.ok || !seatsRes.ok) throw new Error('Ошибка загрузки')
      const showData = await showRes.json()
      const seatsData = await seatsRes.json()
      setShow(showData.data ?? showData)
      const allSeats = seatsData.data ?? seatsData ?? []
      setSeats(
        allSeats
          .filter((s: { id: string }) => seatIds.includes(s.id))
          .map((s: { id: string; row: number; seatNumber: number; sector?: { name: string }; price?: number }) => ({
            id: s.id, row: s.row, seatNumber: s.seatNumber,
            sectorName: s.sector?.name ?? '', price: s.price ?? 0,
          }))
      )
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }, [showId, seatIdsParam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])

  const total = seats.reduce((sum, s) => sum + s.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!customerName.trim()) newErrors.name = 'Введите ФИО'
    if (!customerPhone.trim()) newErrors.phone = 'Введите телефон'
    if (!paymentMethod) newErrors.payment = 'Выберите способ оплаты'
    if (!agreed) newErrors.agree = 'Примите условия'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId, seatIds, customerName, customerPhone, customerEmail, paymentMethod,
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Ошибка'); return }
      const orderId = json.data?.order?.id ?? json.order?.id ?? json.id
      const orderNumber = json.data?.order?.orderNumber ?? json.order?.orderNumber ?? json.orderNumber
      router.push(`checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`)
    } catch {
      toast.error('Ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-brown mb-4">{fetchError}</p>
          <button onClick={() => router.back()} className="px-4 py-2 border border-brown/20 rounded-lg">
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5">
            <h3 className="font-heading font-bold text-darkBrown mb-4">{t('checkout.customerInfo')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1">{t('checkout.fullName')}</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-brown/20 rounded-xl bg-cream/30 focus:ring-2 focus:ring-burgundy/30" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-1">{t('checkout.phone')}</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+7 777 000 00 00"
                  className="w-full px-4 py-3 border border-brown/20 rounded-xl bg-cream/30 focus:ring-2 focus:ring-burgundy/30" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-1">{t('checkout.email')} (необязательно)</label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-brown/20 rounded-xl bg-cream/30 focus:ring-2 focus:ring-burgundy/30" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5">
            <h3 className="font-heading font-bold text-darkBrown mb-4">{t('checkout.paymentMethod')}</h3>
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} error={errors.payment} />
          </div>

          {/* Terms + Submit */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-burgundy" />
              <span className="text-sm text-brown">{t('checkout.agree')} <span className="text-burgundy underline">{t('checkout.terms')}</span></span>
            </label>
            {errors.agree && <p className="text-xs text-red-500">{errors.agree}</p>}

            <div className="flex items-center gap-2 text-xs text-brown/50">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Ваши данные защищены</span>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {paymentMethod === 'CASH' ? t('checkout.reserve') : `${t('checkout.pay')} ${formatPrice(total)}`}
            </button>
          </div>
        </form>

        {show && (
          <div className="lg:sticky lg:top-8">
            <OrderSummary
              eventTitle={show.event.titleRu}
              eventPoster={show.event.posterImage}
              dateTime={show.dateTime}
              hallName={show.hall.name}
              seats={seats}
              timerSeconds={timerSeconds}
            />
          </div>
        )}
      </div>
    </div>
  )
}
