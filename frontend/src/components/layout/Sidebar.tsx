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
  { href: '/summary', label: 'Relatorios', icon: BarChart3 },
  { href: '/assistant', label: 'Assistente financeiro', icon: Bot },
];

export function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'hidden h-full shrink-0 overflow-y-auto border-r border-neutral-200 bg-white transition-all duration-300 md:block',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-3">
        {!isCollapsed && (
          <div className="px-3 pb-3 pt-1 text-xs font-bold uppercase text-[#666666]">
            Menu principal
          </div>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={clsx(
                  'flex items-center border-l-4 py-2.5 text-sm font-semibold transition-colors',
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive
                    ? 'border-[#009C3B] bg-[#009C3B]/10 text-[#006B2B]'
                    : 'border-transparent text-[#555555] hover:bg-neutral-50 hover:text-[#222222]'
                )}
              >
                <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-[#009C3B]' : 'text-[#777777]')} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
