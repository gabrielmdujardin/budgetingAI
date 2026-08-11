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
      <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform">
        <div className="flex h-14 items-center justify-between border-b border-[#006B2B] bg-[#009C3B] px-4 text-white">
          <span className="text-lg font-extrabold tracking-tight">Budgeting</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors hover:bg-white/15"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 pb-2 text-xs font-bold uppercase text-[#666666]">
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
                  'flex items-center gap-3 rounded-md border-l-4 px-3 py-3 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-[#009C3B] bg-[#009C3B]/10 text-[#006B2B]'
                    : 'border-transparent text-[#555555] hover:bg-neutral-50 hover:text-[#222222]'
                )}
              >
                <Icon className={clsx('h-5 w-5', isActive ? 'text-[#009C3B]' : 'text-[#777777]')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
