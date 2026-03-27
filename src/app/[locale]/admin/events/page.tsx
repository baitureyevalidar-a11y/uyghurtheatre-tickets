'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

interface Event {
  id: string
  titleRu: string
  titleKz: string
  titleUy: string
  genre: string
  ageRestriction: string
  isActive: boolean
  duration: number
  _count?: { shows: number }
}

export default function AdminEventsPage() {
  const locale = useLocale()
  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((d) => setEvents(d.events || d))
      .catch(console.error)
  }, [])

  const filtered = events.filter((e) =>
    e.titleRu.toLowerCase().includes(search.toLowerCase())
  )

  const genreLabels: Record<string, string> = {
    COMEDY: 'Комедия', DRAMA: 'Драма', MUSICAL: 'Мюзикл',
    CONCERT: 'Концерт', CHILDREN: 'Детский', FOLKLORE: 'Фольклор', OTHER: 'Другое',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-darkBrown">Мероприятия</h1>
        <a href={`/${locale}/admin/events/new/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy/90 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <div className="p-4 border-b border-brown/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
              className="w-full pl-10 pr-4 py-2 border border-brown/20 rounded-lg text-sm bg-cream/50" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Жанр</th>
              <th className="px-4 py-3">Возраст</th>
              <th className="px-4 py-3">Длит.</th>
              <th className="px-4 py-3">Активен</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => (
              <tr key={event.id} className="border-b border-brown/5 hover:bg-cream/30">
                <td className="px-4 py-3 font-medium text-darkBrown">{event.titleRu}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 bg-burgundy/10 text-burgundy rounded-full">
                    {genreLabels[event.genre] || event.genre}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{event.ageRestriction}</td>
                <td className="px-4 py-3 text-sm">{event.duration} мин</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${event.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {event.isActive ? 'Да' : 'Нет'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a href={`/${locale}/admin/events/${event.id}/edit`}
                      className="p-1.5 text-brown/40 hover:text-burgundy rounded-lg hover:bg-burgundy/5">
                      <Edit className="w-4 h-4" />
                    </a>
                    <button className="p-1.5 text-brown/40 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brown/40">Нет мероприятий</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
