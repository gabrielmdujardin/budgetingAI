import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Budgeting - Portal financeiro pessoal',
  description: 'Gerenciamento financeiro pessoal com dashboard, transacoes, relatorios e comandos por voz.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#F5F5F5] text-[#222222] antialiased selection:bg-[#009C3B] selection:text-white">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
