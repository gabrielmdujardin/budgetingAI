'use client';

import { Bell, ChevronDown, Menu, User } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#006B2B] bg-[#009C3B] text-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 md:inline-flex"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            Budgeting
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-md p-2 text-white transition-colors hover:bg-white/10" aria-label="Notificacoes">
            <Bell className="h-4 w-4" />
          </button>

          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-white/10">
            <span className="hidden sm:inline">Ola, Gabriel</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 sm:hidden">
              <User className="h-4 w-4" />
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
