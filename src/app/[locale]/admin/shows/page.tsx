'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Plus, Edit } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Show {
  id: string
  dateTime: string
  status: string
  event: { titleRu: string }
  hall: { name: string }
  _count?: { tickets: number }
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 text-gray-600',
  ON_SALE: 'bg-green-100 text-green-700',
  SOLD_OUT: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-red-50 text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-600',
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Запланирован', ON_SALE: 'В продаже', SOLD_OUT: 'Распродан',
  CANCELLED: 'Отменён', COMPLETED: 'Проведён',
}

export default function AdminShowsPage() {
  const locale = useLocale()
  const [shows, setShows] = useState<Show[]>([])

  useEffect(() => {
    fetch('/api/admin/shows')
      .then((r) => r.json())
      .then((d) => setShows(d.shows || d))
      .catch(console.error)
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-darkBrown">Показы</h1>
        <a href={`/${locale}/admin/shows/new/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy/90 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Спектакль</th>
              <th className="px-4 py-3">Дата/время</th>
              <th className="px-4 py-3">Зал</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Билеты</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr key={show.id} className="border-b border-brown/5 hover:bg-cream/30">
                <td className="px-4 py-3 font-medium text-darkBrown">{show.event?.titleRu}</td>
                <td className="px-4 py-3 text-sm">{formatDateTime(show.dateTime)}</td>
                <td className="px-4 py-3 text-sm">{show.hall?.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[show.status] || 'bg-gray-100'}`}>
                    {statusLabels[show.status] || show.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{show._count?.tickets ?? 0}</td>
                <td className="px-4 py-3">
                  <a href={`/${locale}/admin/shows/${show.id}/edit`}
                    className="p-1.5 text-brown/40 hover:text-burgundy rounded-lg hover:bg-burgundy/5 inline-block">
                    <Edit className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
            {shows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brown/40">Нет показов</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
