'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileMenu } from '@/components/layout/MobileMenu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <Sidebar />
        <main className="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
