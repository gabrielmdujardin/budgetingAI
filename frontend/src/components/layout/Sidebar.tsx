'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  CreditCard,
  LayoutDashboard,
  Tags,
} from 'lucide-react';
import { clsx } from 'clsx';

export const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: CreditCard },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/summary', label: 'Relatórios', icon: BarChart3 },
  { href: '/assistant', label: 'Assistente', icon: Bot },
];

export function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'hidden h-full shrink-0 overflow-y-auto border-r border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 md:block',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="p-3">
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
                  'flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-150',
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5',
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-text-secondary hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={clsx('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-text-secondary')} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
