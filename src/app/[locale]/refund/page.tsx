'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function RefundPage() {
  const t = useTranslations('refund')
  const [ticketId, setTicketId] = useState('')
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, reason }),
      })
      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: `Запрос на возврат создан. Сумма возврата: ${data.refund?.amount} ₸` })
      } else {
        setResult({ success: false, message: data.error || 'Ошибка при создании запроса' })
      }
    } catch {
      setResult({ success: false, message: 'Ошибка сети' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-darkBrown mb-2">{t('requestRefund')}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6 mb-6">
        <h3 className="font-heading font-bold text-darkBrown mb-3">Правила возврата</h3>
        <ul className="space-y-2 text-sm text-brown/70">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">●</span>
            <span>Более 7 дней до спектакля — возврат 100%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">●</span>
            <span>3-7 дней до спектакля — возврат 70%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">●</span>
            <span>1-3 дня до спектакля — возврат 50%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">●</span>
            <span>Менее 24 часов — возврат невозможен</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">●</span>
            <span>Отмена театром — полный возврат автоматически</span>
          </li>
        </ul>
      </div>

      {result && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {result.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
          <p>{result.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-brown/5 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brown mb-1">ID билета</label>
          <input type="text" value={ticketId} onChange={(e) => setTicketId(e.target.value)}
            placeholder="Введите ID билета из заказа..."
            className="w-full px-4 py-3 border border-brown/20 rounded-xl bg-cream/30" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-brown mb-1">{t('reason')}</label>
          <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Укажите причину возврата..."
            className="w-full px-4 py-3 border border-brown/20 rounded-xl bg-cream/30" required />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy/90 disabled:opacity-50">
          {loading ? '...' : t('submit')}
        </button>
      </form>
    </div>
  )
}
