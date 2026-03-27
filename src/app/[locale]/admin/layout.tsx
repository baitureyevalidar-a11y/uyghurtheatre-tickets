'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  LayoutDashboard, Calendar, Film, ShoppingBag, RotateCcw,
  Users, Banknote, Settings, FileText, Menu, X, LogOut, ChevronRight,
} from 'lucide-react'

const navItems = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard, label: 'Дашборд' },
  { key: 'events', href: '/admin/events', icon: Calendar, label: 'Мероприятия' },
  { key: 'shows', href: '/admin/shows', icon: Film, label: 'Показы' },
  { key: 'orders', href: '/admin/orders', icon: ShoppingBag, label: 'Заказы' },
  { key: 'refunds', href: '/admin/refunds', icon: RotateCcw, label: 'Возвраты' },
  { key: 'users', href: '/admin/users', icon: Users, label: 'Пользователи' },
  { key: 'cashier', href: '/admin/cashier', icon: Banknote, label: 'Касса' },
  { key: 'settings', href: '/admin/settings', icon: Settings, label: 'Настройки' },
  { key: 'audit', href: '/admin/audit', icon: FileText, label: 'Аудит' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === '/admin') return pathname === fullHref
    return pathname.startsWith(fullHref)
  }

  return (
    <div className="flex h-screen bg-cream overflow-hidden -mt-[1px]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-darkBrown transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-gold font-heading font-bold text-lg">Ұйғыр театры</h2>
            <p className="text-white/40 text-xs">Админ-панель</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <a
                key={item.key}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-burgundy text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </a>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <a href={`/${locale}`}
            className="flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            Выйти
          </a>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-brown/10 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-brown">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs px-2 py-1 bg-burgundy/10 text-burgundy rounded-full font-medium">ADMIN</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
