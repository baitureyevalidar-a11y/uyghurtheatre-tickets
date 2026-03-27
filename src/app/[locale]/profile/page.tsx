'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import toast from 'react-hot-toast'
import {
  Loader2, Ticket, History, User, Download,
  RefreshCw, ChevronDown, ChevronUp, Calendar, MapPin,
} from 'lucide-react'
import { cn, formatPrice, formatDateTime, formatDate } from '@/lib/utils'

interface TicketData {
  id: string
  qrCode: string
  status: string
  seat: { row: number; seatNumber: number; sector: { name: string; color: string } }
  show: {
    dateTime: string
    event: { titleRu: string; titleKz: string; titleUy: string; posterImage?: string }
    hall: { name: string }
  }
}

interface OrderData {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  paymentMethod: string
  createdAt: string
  tickets: TicketData[]
}

const statusMap: Record<string, { label: string; cls: string }> = {
  RESERVED: { label: 'Забронирован', cls: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Оплачен', cls: 'bg-green-100 text-green-800' },
  USED: { label: 'Использован', cls: 'bg-gray-100 text-gray-600' },
  CANCELLED: { label: 'Отменён', cls: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Возвращён', cls: 'bg-purple-100 text-purple-700' },
  PENDING: { label: 'Ожидает', cls: 'bg-blue-100 text-blue-700' },
}

function StatusBadge({ status }: { status: string }) {
  const info = statusMap[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', info.cls)}>{info.label}</span>
}

export default function ProfilePage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [tab, setTab] = useState('tickets')
  const [session, setSession] = useState<{ user: { id: string; fullName: string; phone: string; email?: string } } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Profile form state
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileEmail, setProfileEmail] = useState('')

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace(`/${locale}/auth/login`)
        } else {
          setSession(data)
          setProfileName(data.user.fullName || '')
          setProfilePhone(data.user.phone || '')
          setProfileEmail(data.user.email || '')
        }
      })
      .catch(() => router.replace(`/${locale}/auth/login`))
      .finally(() => setSessionLoading(false))
  }, [router, locale, pathname])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders')
      const json = await res.json()
      setOrders(json.data ?? json.orders ?? json ?? [])
    } catch { toast.error('Ошибка загрузки') }
    finally { setOrdersLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const now = new Date()
  const allTickets = orders.flatMap((o) => o.tickets || [])
  const upcoming = allTickets.filter((tk) => new Date(tk.show.dateTime) >= now && ['PAID', 'RESERVED'].includes(tk.status))
  const past = allTickets.filter((tk) => new Date(tk.show.dateTime) < now || ['USED', 'CANCELLED', 'REFUNDED'].includes(tk.status))

  const getTitle = (tk: TicketData) =>
    locale === 'kz' ? tk.show.event.titleKz : locale === 'uy' ? tk.show.event.titleUy : tk.show.event.titleRu

  if (sessionLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>
  }
  if (!session) return null

  const tabs = [
    { key: 'tickets', label: t('tickets.myTickets'), icon: Ticket },
    { key: 'history', label: 'История', icon: History },
    { key: 'settings', label: 'Профиль', icon: User },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold text-darkBrown mb-1">{t('tickets.myTickets')}</h1>
      <p className="text-brown/60 mb-6">{session.user.fullName}</p>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-brown/10 mb-6">
        {tabs.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === item.key ? 'bg-burgundy text-white' : 'text-brown/50 hover:text-brown')}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tickets tab */}
      {tab === 'tickets' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading font-bold text-darkBrown mb-3">{t('tickets.upcoming')}</h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-10 text-brown/40 border border-dashed border-brown/20 rounded-xl">
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Нет предстоящих билетов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((tk) => (
                  <div key={tk.id} className="bg-white rounded-xl border border-brown/5 p-4 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-14 h-18 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-5 h-5 text-burgundy/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-darkBrown text-sm">{getTitle(tk)}</h3>
                        <div className="flex items-center gap-1 text-xs text-brown/50 mt-1">
                          <Calendar className="w-3 h-3" /> {formatDateTime(tk.show.dateTime)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-brown/50">
                          <MapPin className="w-3 h-3" /> {tk.show.hall.name}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-burgundy/10 text-burgundy rounded-full font-medium">
                            Ряд {tk.seat.row}, Место {tk.seat.seatNumber}
                          </span>
                          <span className="text-xs text-brown/40">{tk.seat.sector.name}</span>
                          <StatusBadge status={tk.status} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="text-xs px-3 py-1.5 border border-brown/20 rounded-lg flex items-center gap-1 text-brown hover:bg-cream">
                        <Download className="w-3 h-3" /> {t('tickets.download')}
                      </button>
                      {tk.status === 'PAID' && (
                        <a href={`/${locale}/refund`} className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                          {t('tickets.requestRefund')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-darkBrown mb-3">{t('tickets.past')}</h2>
              <div className="space-y-3">
                {past.map((tk) => (
                  <div key={tk.id} className="bg-white rounded-xl border border-brown/5 p-4 opacity-60">
                    <p className="font-heading font-semibold text-darkBrown text-sm">{getTitle(tk)}</p>
                    <p className="text-xs text-brown/40 mt-1">{formatDateTime(tk.show.dateTime)} — Ряд {tk.seat.row}, Место {tk.seat.seatNumber}</p>
                    <StatusBadge status={tk.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-darkBrown">История заказов</h2>
            <button onClick={fetchOrders} disabled={ordersLoading}
              className="text-xs px-3 py-1.5 border border-brown/20 rounded-lg flex items-center gap-1 text-brown hover:bg-cream">
              <RefreshCw className={cn('w-3 h-3', ordersLoading && 'animate-spin')} /> Обновить
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-brown/40 border border-dashed border-brown/20 rounded-xl">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>История пуста</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-brown/5 overflow-hidden">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream/30"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center text-sm">
                    <span className="font-mono font-semibold text-darkBrown">{order.orderNumber}</span>
                    <span className="text-brown/50 hidden sm:block">{formatDate(order.createdAt)}</span>
                    <span className="font-semibold text-burgundy">{formatPrice(Number(order.totalAmount))}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-brown/40" /> : <ChevronDown className="w-4 h-4 text-brown/40" />}
                </button>
                {expandedOrder === order.id && (
                  <div className="border-t border-brown/5 px-4 py-3 bg-cream/30 space-y-1">
                    {order.tickets?.map((tk) => (
                      <div key={tk.id} className="flex justify-between text-sm py-1">
                        <span>{tk.show.event.titleRu} — Ряд {tk.seat.row}, М. {tk.seat.seatNumber}</span>
                        <StatusBadge status={tk.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5 space-y-4">
          <h3 className="font-heading font-bold text-darkBrown">Личные данные</h3>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">ФИО</label>
            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Телефон</label>
            <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown mb-1">Email</label>
            <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-brown/20 rounded-lg bg-cream/30" />
          </div>
          <button onClick={() => toast.success('Профиль сохранён')}
            className="px-6 py-2.5 bg-burgundy text-white rounded-lg hover:bg-burgundy/90">
            {t('common.save')}
          </button>
        </div>
      )}
    </div>
  )
}
