'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'

interface Refund {
  id: string
  amount: number
  reason: string
  status: string
  createdAt: string
  order: { orderNumber: string; customerName: string }
  ticket: { show: { event: { titleRu: string }; dateTime: string }; seat: { row: number; seatNumber: number } }
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([])

  useEffect(() => {
    fetch('/api/admin/orders?type=refunds')
      .then((r) => r.json())
      .then((d) => setRefunds(d.refunds || d || []))
      .catch(console.error)
  }, [])

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch(`/api/admin/refunds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-6">Возвраты</h1>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Заказ</th>
              <th className="px-4 py-3">Спектакль</th>
              <th className="px-4 py-3">Место</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Причина</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={refund.id} className="border-b border-brown/5 hover:bg-cream/30">
                <td className="px-4 py-3">
                  <p className="font-mono text-sm text-burgundy">{refund.order?.orderNumber}</p>
                  <p className="text-xs text-brown/40">{refund.order?.customerName}</p>
                </td>
                <td className="px-4 py-3 text-sm">{refund.ticket?.show?.event?.titleRu}</td>
                <td className="px-4 py-3 text-sm">
                  Ряд {refund.ticket?.seat?.row}, Место {refund.ticket?.seat?.seatNumber}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(refund.amount))}</td>
                <td className="px-4 py-3 text-sm text-brown/60 max-w-[200px] truncate">{refund.reason}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    refund.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-700' :
                    refund.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    refund.status === 'PROCESSED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-600'
                  }`}>{refund.status}</span>
                </td>
                <td className="px-4 py-3">
                  {refund.status === 'REQUESTED' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleAction(refund.id, 'APPROVED')}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(refund.id, 'REJECTED')}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {refunds.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-brown/40">Нет запросов на возврат</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
