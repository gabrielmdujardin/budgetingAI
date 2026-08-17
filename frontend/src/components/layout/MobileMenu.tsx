'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { navItems } from '@/components/layout/Sidebar';

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-surface border-r border-border shadow-2xl transition-transform">
        <div className="flex h-16 items-center justify-between border-b border-border bg-transparent px-4 text-text">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Budgeting
          </span>
            <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pb-2 text-xs font-bold uppercase text-text-secondary">
          Menu principal
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                )}
              >
                <Icon className={clsx('h-5 w-5', isActive ? 'text-primary' : 'text-text-secondary')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
