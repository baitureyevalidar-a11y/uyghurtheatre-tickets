'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  totalAmount: number
  currency: string
  status: string
  paymentMethod: string | null
  createdAt: string
  tickets: Array<{ id: string; seat: { row: number; seatNumber: number; sector: { name: string } } }>
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600', EXPIRED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-purple-100 text-purple-600', PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-600',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || d))
      .catch(console.error)
  }, [])

  const filtered = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search)
  )

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-6">Заказы</h1>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <div className="p-4 border-b border-brown/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру, ФИО, телефону..."
              className="w-full pl-10 pr-4 py-2 border border-brown/20 rounded-lg text-sm bg-cream/50" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Заказ</th>
              <th className="px-4 py-3">Покупатель</th>
              <th className="px-4 py-3">Сумма</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Оплата</th>
              <th className="px-4 py-3">Дата</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <>
                <tr key={order.id} className="border-b border-brown/5 hover:bg-cream/30 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                  <td className="px-4 py-3 font-mono text-sm font-medium text-burgundy">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-darkBrown text-sm">{order.customerName}</p>
                    <p className="text-xs text-brown/40">{order.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brown/60">{order.paymentMethod || '—'}</td>
                  <td className="px-4 py-3 text-sm text-brown/60">{formatDateTime(order.createdAt)}</td>
                </tr>
                {expandedId === order.id && order.tickets && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={6} className="px-4 py-3 bg-cream/50">
                      <div className="flex flex-wrap gap-2">
                        {order.tickets.map((t) => (
                          <span key={t.id} className="text-xs px-3 py-1.5 bg-white rounded-lg border border-brown/10">
                            {t.seat?.sector?.name} — Ряд {t.seat?.row}, Место {t.seat?.seatNumber}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brown/40">Нет заказов</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
