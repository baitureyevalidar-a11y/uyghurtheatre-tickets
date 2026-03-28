'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Calendar, Film, ShoppingBag, RotateCcw,
  Users, Banknote, Settings, FileText, Menu, X, LogOut, ChevronRight, Loader2,
  Theater,
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

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CASHIER']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const { data: session, status } = useSession()

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === '/admin') return pathname === fullHref
    return pathname.startsWith(fullHref)
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
          <p className="text-cream/40 text-xs">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session?.user || !ADMIN_ROLES.includes((session.user as { role?: string }).role || '')) {
    if (typeof window !== 'undefined') {
      router.replace(`/${locale}/auth/login?callbackUrl=/${locale}/admin`)
    }
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-cream/40 text-sm">Перенаправление...</p>
        </div>
      </div>
    )
  }

  const userRole = (session.user as { role?: string }).role || 'ADMIN'
  const userName = session.user.name || (session.user as { fullName?: string }).fullName || session.user.email

  return (
    <div className="flex h-screen bg-[#0D0D0D] overflow-hidden -mt-[1px]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light">
            <Theater className="w-5 h-5 text-darkBrown" />
          </div>
          <div>
            <h2 className="text-cream font-heading font-bold text-sm">Ұйғыр театры</h2>
            <p className="text-cream/30 text-[10px] uppercase tracking-wider">Админ-панель</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <a
                key={item.key}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-cream/50 hover:bg-white/5 hover:text-cream border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-gold' : ''}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-gold/60" />}
              </a>
            )
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-burgundy/30 border border-burgundy/40 flex items-center justify-center">
              <span className="text-xs font-bold text-cream">{String(userName)?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream/70 text-xs font-medium truncate">{userName}</p>
              <p className="text-gold/60 text-[10px] uppercase tracking-wider">{userRole}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="flex items-center gap-2 px-3 py-2 text-cream/30 hover:text-red-400 text-xs rounded-lg hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#111111] border-b border-white/5 px-5 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-cream/60 hover:text-cream">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-[10px] px-2.5 py-1 bg-gold/10 text-gold rounded-full font-bold uppercase tracking-wider border border-gold/20">
            {userRole}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
