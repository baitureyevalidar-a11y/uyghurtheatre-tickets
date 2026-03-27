'use client'

import { useState, useEffect } from 'react'
import { QrCode, Printer, Check, ShoppingBag } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'

interface Show {
  id: string
  dateTime: string
  event: { titleRu: string }
  hall: { name: string }
}

export default function CashierPage() {
  const [shows, setShows] = useState<Show[]>([])
  const [selectedShow, setSelectedShow] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [checkResult, setCheckResult] = useState<{ valid: boolean; message: string } | null>(null)
  const [step, setStep] = useState<'select' | 'sell'>('select')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    fetch('/api/admin/shows')
      .then((r) => r.json())
      .then((d) => setShows((d.shows || d || []).filter((s: Show) => new Date(s.dateTime) > new Date())))
      .catch(console.error)
  }, [])

  const handleCheckIn = async () => {
    if (!qrInput) return
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(qrInput)}`)
      const data = await res.json()
      if (data.valid && data.ticket?.status === 'PAID') {
        await fetch(`/api/tickets/${data.ticket.id}/checkin`, { method: 'POST' })
        setCheckResult({ valid: true, message: `Вход: ${data.ticket.show?.event?.titleRu} — Ряд ${data.ticket.seat?.row}, Место ${data.ticket.seat?.seatNumber}` })
      } else {
        setCheckResult({ valid: false, message: `Билет: ${data.ticket?.status || 'не найден'}` })
      }
    } catch {
      setCheckResult({ valid: false, message: 'Ошибка проверки' })
    }
    setQrInput('')
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-6">Касса</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Check-in */}
        <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6">
          <h3 className="font-heading font-bold text-darkBrown mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-burgundy" /> Проверка QR-кода
          </h3>
          <div className="flex gap-2">
            <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              placeholder="Сканируйте или введите код..."
              className="flex-1 px-4 py-3 border border-brown/20 rounded-lg bg-cream/30" autoFocus />
            <button onClick={handleCheckIn} className="px-4 py-3 bg-burgundy text-white rounded-lg hover:bg-burgundy/90">
              <Check className="w-5 h-5" />
            </button>
          </div>
          {checkResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${checkResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {checkResult.valid ? '✓' : '✗'} {checkResult.message}
            </div>
          )}
        </div>

        {/* Sell Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6">
          <h3 className="font-heading font-bold text-darkBrown mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-burgundy" /> Продажа билетов
          </h3>

          {step === 'select' && (
            <div className="space-y-3">
              <select value={selectedShow} onChange={(e) => setSelectedShow(e.target.value)}
                className="w-full px-4 py-3 border border-brown/20 rounded-lg bg-cream/30">
                <option value="">Выберите показ...</option>
                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.event?.titleRu} — {formatDateTime(show.dateTime)}
                  </option>
                ))}
              </select>
              {selectedShow && (
                <button onClick={() => setStep('sell')}
                  className="w-full py-3 bg-burgundy text-white rounded-lg hover:bg-burgundy/90">
                  Выбрать места
                </button>
              )}
            </div>
          )}

          {step === 'sell' && (
            <div className="space-y-3">
              <p className="text-sm text-brown/60">Показ: {shows.find((s) => s.id === selectedShow)?.event?.titleRu}</p>
              <input placeholder="ФИО покупателя" value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
              <input placeholder="Телефон" value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Оплата наличными
                </button>
                <button className="py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Печать
                </button>
              </div>
              <button onClick={() => setStep('select')} className="w-full py-2 border border-brown/20 rounded-lg text-sm text-brown">Назад</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
