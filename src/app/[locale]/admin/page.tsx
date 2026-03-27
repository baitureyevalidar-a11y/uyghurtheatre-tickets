'use client'

import { useState, useEffect } from 'react'
import { Ticket, DollarSign, Users, Clock, RotateCcw } from 'lucide-react'

interface DashboardData {
  ticketsToday: number
  ticketsWeek: number
  ticketsMonth: number
  revenueWeek: number
  revenueMonth: number
  activeReservations: number
  refundRequests: number
  occupancyPercent: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  const stats = [
    { label: 'Билетов сегодня', value: data?.ticketsToday ?? 0, icon: Ticket, color: 'bg-burgundy' },
    { label: 'Выручка за неделю', value: `${(data?.revenueWeek ?? 0).toLocaleString()} ₸`, icon: DollarSign, color: 'bg-gold' },
    { label: 'Заполняемость', value: `${data?.occupancyPercent ?? 0}%`, icon: Users, color: 'bg-green-600' },
    { label: 'Активных броней', value: data?.activeReservations ?? 0, icon: Clock, color: 'bg-blue-600' },
    { label: 'Запросов возврата', value: data?.refundRequests ?? 0, icon: RotateCcw, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-6">Дашборд</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-brown/5">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-darkBrown">{stat.value}</p>
                  <p className="text-xs text-brown/50">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5">
          <h3 className="font-heading font-bold text-darkBrown mb-4">Продажи за месяц</h3>
          <div className="h-64 flex items-center justify-center text-brown/30">
            <p>Графики продаж (recharts)</p>
          </div>
          <p className="text-sm text-brown/40 mt-2">Билетов за месяц: {data?.ticketsMonth ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5">
          <h3 className="font-heading font-bold text-darkBrown mb-4">Выручка по мероприятиям</h3>
          <div className="h-64 flex items-center justify-center text-brown/30">
            <p>Диаграмма выручки (recharts)</p>
          </div>
          <p className="text-sm text-brown/40 mt-2">Общая выручка: {(data?.revenueMonth ?? 0).toLocaleString()} ₸</p>
        </div>
      </div>
    </div>
  )
}
