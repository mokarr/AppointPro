'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardHeader() {
    const { t } = useLanguage();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = t(key);
        return typeof value === 'string' ? value : '';
    };

    return (
        <header className="h-16 border-b flex items-center px-6">
            <div className="flex-1">
                <Link href="/dashboard" className="text-xl font-bold">
                    {getString('common.appName')}
                </Link>
            </div>
            <nav className="flex items-center space-x-4">
                <LanguageSwitcher />
                <Link href="/dashboard/profile" className="text-sm font-medium hover:text-blue-500 transition-colors">
                    {getString('common.profile')}
                </Link>
                <Link href="/api/auth/signout" className="text-sm font-medium hover:text-blue-500 transition-colors">
                    {getString('common.logout')}
                </Link>
            </nav>
        </header>
    );
} 