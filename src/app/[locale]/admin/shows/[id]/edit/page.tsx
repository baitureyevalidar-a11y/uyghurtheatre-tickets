'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Save, ArrowLeft } from 'lucide-react'

export default function ShowEditPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const isNew = params.id === 'new'

  const [form, setForm] = useState({
    eventId: '', hallId: '', dateTime: '',
    ticketSalesStart: '', ticketSalesEnd: '', specialConditions: '',
  })
  const [events, setEvents] = useState<Array<{ id: string; titleRu: string }>>([])
  const [halls, setHalls] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/events').then((r) => r.json()).then((d) => setEvents(d.events || d))
    // Halls would be fetched similarly
    if (!isNew) {
      fetch(`/api/admin/shows/${params.id}`).then((r) => r.json()).then(setForm)
    }
  }, [isNew, params.id])

  const handleSave = async () => {
    setLoading(true)
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/shows' : `/api/admin/shows/${params.id}`
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push(`/${locale}/admin/shows`)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href={`/${locale}/admin/shows`} className="text-brown/40 hover:text-brown"><ArrowLeft className="w-5 h-5" /></a>
        <h1 className="text-2xl font-heading font-bold text-darkBrown">
          {isNew ? 'Создать показ' : 'Редактировать показ'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brown mb-1">Мероприятие</label>
          <select value={form.eventId} onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value }))}
            className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30">
            <option value="">Выберите...</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.titleRu}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Дата и время</label>
            <input type="datetime-local" value={form.dateTime ? form.dateTime.slice(0, 16) : ''}
              onChange={(e) => setForm((p) => ({ ...p, dateTime: e.target.value }))}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Спецусловия</label>
            <input type="text" value={form.specialConditions}
              onChange={(e) => setForm((p) => ({ ...p, specialConditions: e.target.value }))}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Начало продаж</label>
            <input type="datetime-local" value={form.ticketSalesStart ? form.ticketSalesStart.slice(0, 16) : ''}
              onChange={(e) => setForm((p) => ({ ...p, ticketSalesStart: e.target.value }))}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Конец продаж</label>
            <input type="datetime-local" value={form.ticketSalesEnd ? form.ticketSalesEnd.slice(0, 16) : ''}
              onChange={(e) => setForm((p) => ({ ...p, ticketSalesEnd: e.target.value }))}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-brown/10">
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-lg hover:bg-burgundy/90 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <a href={`/${locale}/admin/shows`} className="px-6 py-2.5 border border-brown/20 rounded-lg text-brown hover:bg-cream">Отмена</a>
        </div>
      </div>
    </div>
  )
}
