'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

interface Settings {
  refund_7days_percent: string
  refund_3to7days_percent: string
  refund_1to3days_percent: string
  refund_less24h_percent: string
  online_reservation_minutes: string
  cashier_reservation_hours: string
  theater_name: string
  theater_address: string
  theater_phone: string
  theater_email: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    refund_7days_percent: '100', refund_3to7days_percent: '70',
    refund_1to3days_percent: '50', refund_less24h_percent: '0',
    online_reservation_minutes: '15', cashier_reservation_hours: '48',
    theater_name: '', theater_address: '', theater_phone: '', theater_email: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === 'object') setSettings((prev) => ({ ...prev, ...data })) })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const update = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-6">Настройки системы</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6">
          <h3 className="font-heading font-bold text-darkBrown mb-4">Правила возвратов</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-brown/60 mb-1">Более 7 дней (%)</label>
              <input type="number" value={settings.refund_7days_percent} onChange={update('refund_7days_percent')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">3-7 дней (%)</label>
              <input type="number" value={settings.refund_3to7days_percent} onChange={update('refund_3to7days_percent')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">1-3 дня (%)</label>
              <input type="number" value={settings.refund_1to3days_percent} onChange={update('refund_1to3days_percent')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">Менее 24 часов (%)</label>
              <input type="number" value={settings.refund_less24h_percent} onChange={update('refund_less24h_percent')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6">
          <h3 className="font-heading font-bold text-darkBrown mb-4">Бронирование</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-brown/60 mb-1">Онлайн резерв (минуты)</label>
              <input type="number" value={settings.online_reservation_minutes} onChange={update('online_reservation_minutes')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">Касса резерв (часы)</label>
              <input type="number" value={settings.cashier_reservation_hours} onChange={update('cashier_reservation_hours')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brown/5 p-6">
          <h3 className="font-heading font-bold text-darkBrown mb-4">Контакты театра</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-brown/60 mb-1">Название</label>
              <input type="text" value={settings.theater_name} onChange={update('theater_name')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">Адрес</label>
              <input type="text" value={settings.theater_address} onChange={update('theater_address')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
            <div>
              <label className="block text-sm text-brown/60 mb-1">Телефон</label>
              <input type="text" value={settings.theater_phone} onChange={update('theater_phone')}
                className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-burgundy/90">
          <Save className="w-4 h-4" /> {saved ? 'Сохранено!' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  )
}
