'use client'

import { useState, useEffect } from 'react'
import { Ticket, DollarSign, Users, Clock, RotateCcw, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

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
    {
      label: 'Билетов сегодня',
      value: data?.ticketsToday ?? 0,
      icon: Ticket,
      gradient: 'from-burgundy to-burgundy-dark',
      iconBg: 'bg-burgundy/20',
      iconColor: 'text-burgundy',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Выручка за неделю',
      value: `${(data?.revenueWeek ?? 0).toLocaleString()} ₸`,
      icon: DollarSign,
      gradient: 'from-gold to-gold-light',
      iconBg: 'bg-gold/20',
      iconColor: 'text-gold',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Заполняемость',
      value: `${data?.occupancyPercent ?? 0}%`,
      icon: Users,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Активных броней',
      value: data?.activeReservations ?? 0,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      trend: '-3%',
      trendUp: false,
    },
    {
      label: 'Запросов возврата',
      value: data?.refundRequests ?? 0,
      icon: RotateCcw,
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      trend: '-2%',
      trendUp: false,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-cream mb-1">Дашборд</h1>
        <p className="text-cream/40 text-sm">Обзор показателей театра</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight
          return (
            <div key={stat.label} className="bg-[#161616] rounded-xl p-4 border border-white/5 hover:border-gold/20 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-cream mb-0.5">{stat.value}</p>
              <p className="text-[11px] text-cream/40">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#161616] rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-cream text-sm">Продажи за месяц</h3>
            <div className="flex items-center gap-1 text-gold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{data?.ticketsMonth ?? 0} билетов</span>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-cream/20 text-sm">Графики продаж (recharts)</p>
          </div>
        </div>

        <div className="bg-[#161616] rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-cream text-sm">Выручка по мероприятиям</h3>
            <div className="flex items-center gap-1 text-gold text-xs">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{(data?.revenueMonth ?? 0).toLocaleString()} ₸</span>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-cream/20 text-sm">Диаграмма выручки (recharts)</p>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161616] rounded-xl p-5 border border-white/5">
          <p className="text-cream/30 text-xs uppercase tracking-wider mb-2">Билетов за неделю</p>
          <p className="text-3xl font-heading font-bold text-cream">{data?.ticketsWeek ?? 0}</p>
        </div>
        <div className="bg-[#161616] rounded-xl p-5 border border-white/5">
          <p className="text-cream/30 text-xs uppercase tracking-wider mb-2">Выручка за месяц</p>
          <p className="text-3xl font-heading font-bold text-gold">{(data?.revenueMonth ?? 0).toLocaleString()} ₸</p>
        </div>
        <div className="bg-[#161616] rounded-xl p-5 border border-white/5">
          <p className="text-cream/30 text-xs uppercase tracking-wider mb-2">Билетов за месяц</p>
          <p className="text-3xl font-heading font-bold text-cream">{data?.ticketsMonth ?? 0}</p>
        </div>
      </div>
    </div>
  )
}
