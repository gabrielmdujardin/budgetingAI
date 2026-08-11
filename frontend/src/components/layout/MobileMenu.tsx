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
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Fechar menu"
        type="button"
      />
      <aside className="relative h-full w-80 max-w-[86vw] bg-white shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <span className="text-lg font-extrabold text-[#006B2B]">Budgeting</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#444444] hover:bg-neutral-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 border-l-4 px-3 py-3 text-sm font-semibold',
                  isActive
                    ? 'border-[#009C3B] bg-[#009C3B]/10 text-[#006B2B]'
                    : 'border-transparent text-[#555555]'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
