'use client';

import { Bell, Menu } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Alternar menu"
            title="Alternar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-text">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Budgeting
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications removed */}
        </div>
      </div>
    </header>
  );
}
