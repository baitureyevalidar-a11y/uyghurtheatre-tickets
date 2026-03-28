'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Home, Calendar, Ticket, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();

  const items = [
    { href: `/${locale}`, icon: Home, label: locale === 'ru' ? 'Главная' : 'Басты' },
    { href: `/${locale}/events`, icon: Calendar, label: locale === 'ru' ? 'Афиша' : 'Афиша' },
    { href: `/${locale}/tickets`, icon: Ticket, label: locale === 'ru' ? 'Билеты' : 'Билеттер' },
    { href: `/${locale}/profile`, icon: User, label: locale === 'ru' ? 'Профиль' : 'Профиль' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2 px-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active ? 'text-gold' : 'text-cream/50 hover:text-cream'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
