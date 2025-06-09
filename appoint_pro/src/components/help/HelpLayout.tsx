'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface HelpLayoutProps {
  children: React.ReactNode;
  type: 'customer' | 'business';
}

export default function HelpLayout({ children, type }: HelpLayoutProps) {
  const t = useTranslations('Help');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-rose-500 text-white py-16 px-4">
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold mb-6">{t('welcomeHeader')}</h1>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="pl-12 py-6 rounded-full text-lg bg-white border-none focus:ring-2 focus:ring-rose-300 text-gray-800 shadow-md"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-2">
            {t('footerText')}
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="text-sm text-gray-300 hover:text-white">
              {t('terms')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 