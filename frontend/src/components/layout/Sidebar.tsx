'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  CreditCard,
  Flag,
  LayoutDashboard,
  Settings,
  Tags,
} from 'lucide-react';
import { clsx } from 'clsx';

export const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacoes', icon: CreditCard },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/goals', label: 'Metas', icon: Flag },
  { href: '/summary', label: 'Relatorios', icon: BarChart3 },
  { href: '/assistant', label: 'Assistente financeiro', icon: Bot },
  { href: '/settings', label: 'Configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-neutral-200 bg-white md:block">
      <div className="sticky top-14 p-4">
        <div className="px-3 pb-3 pt-1 text-xs font-bold uppercase text-[#666666]">
          Menu principal
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 border-l-4 px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-[#009C3B] bg-[#009C3B]/10 text-[#006B2B]'
                    : 'border-transparent text-[#555555] hover:bg-neutral-50 hover:text-[#222222]'
                )}
              >
                <Icon className={clsx('h-4 w-4', isActive ? 'text-[#009C3B]' : 'text-[#777777]')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
