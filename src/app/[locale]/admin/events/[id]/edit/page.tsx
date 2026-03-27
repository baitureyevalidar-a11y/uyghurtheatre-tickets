'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Save, ArrowLeft } from 'lucide-react'

export default function EventEditPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const isNew = params.id === 'new'

  const [form, setForm] = useState({
    titleRu: '', titleKz: '', titleUy: '',
    descriptionRu: '', descriptionKz: '', descriptionUy: '',
    posterImage: '', genre: 'DRAMA', duration: 120, ageRestriction: '12+',
    galleryImages: [] as string[],
  })
  const [langTab, setLangTab] = useState('ru')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/events/${params.id}`)
        .then((r) => r.json())
        .then((data) => { if (data) setForm(data) })
        .catch(console.error)
    }
  }, [isNew, params.id])

  const handleSave = async () => {
    setLoading(true)
    try {
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/admin/events' : `/api/admin/events/${params.id}`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push(`/${locale}/admin/events`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const langTabs = [
    { key: 'ru', label: 'Русский' },
    { key: 'kz', label: 'Қазақша' },
    { key: 'uy', label: 'ئۇيغۇرچە' },
  ]

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href={`/${locale}/admin/events`} className="text-brown/40 hover:text-brown">
          <ArrowLeft className="w-5 h-5" />
        </a>
        <h1 className="text-2xl font-heading font-bold text-darkBrown">
          {isNew ? 'Создать мероприятие' : 'Редактировать'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6 space-y-6">
        {/* Language tabs */}
        <div className="flex gap-2 border-b border-brown/10 pb-0">
          {langTabs.map((tab) => (
            <button key={tab.key} onClick={() => setLangTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[1px] ${
                langTab === tab.key ? 'border-burgundy text-burgundy' : 'border-transparent text-brown/40 hover:text-brown'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-brown mb-1">Название ({langTab.toUpperCase()})</label>
          <input type="text"
            value={form[`title${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as keyof typeof form] as string}
            onChange={(e) => update(`title${langTab.charAt(0).toUpperCase() + langTab.slice(1)}`, e.target.value)}
            className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-brown mb-1">Описание ({langTab.toUpperCase()})</label>
          <textarea rows={5}
            value={form[`description${langTab.charAt(0).toUpperCase() + langTab.slice(1)}` as keyof typeof form] as string}
            onChange={(e) => update(`description${langTab.charAt(0).toUpperCase() + langTab.slice(1)}`, e.target.value)}
            className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Жанр</label>
            <select value={form.genre} onChange={(e) => update('genre', e.target.value)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30">
              <option value="DRAMA">Драма</option>
              <option value="COMEDY">Комедия</option>
              <option value="MUSICAL">Мюзикл</option>
              <option value="CONCERT">Концерт</option>
              <option value="CHILDREN">Детский</option>
              <option value="FOLKLORE">Фольклор</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Длительность (мин)</label>
            <input type="number" value={form.duration} onChange={(e) => update('duration', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Возраст</label>
            <select value={form.ageRestriction} onChange={(e) => update('ageRestriction', e.target.value)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30">
              <option value="0+">0+</option>
              <option value="6+">6+</option>
              <option value="12+">12+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
            </select>
          </div>
        </div>

        {/* Poster */}
        <div>
          <label className="block text-sm font-medium text-brown mb-1">Постер (URL)</label>
          <input type="text" value={form.posterImage} onChange={(e) => update('posterImage', e.target.value)}
            placeholder="/images/events/poster.jpg"
            className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-brown/10">
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-lg hover:bg-burgundy/90 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <a href={`/${locale}/admin/events`}
            className="px-6 py-2.5 border border-brown/20 rounded-lg text-brown hover:bg-cream">
            Отмена
          </a>
        </div>
      </div>
    </div>
  )
}
