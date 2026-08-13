'use client';

import { Bell, Menu } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Alternar menu"
            title="Alternar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Budgeting
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Notificações">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
