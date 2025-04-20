'use client';

import { ReactNode } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = t(key);
        return typeof value === 'string' ? value : '';
    };

    // Check if we're in the dashboard section
    const isDashboard = pathname?.startsWith('/dashboard');

    // Don't show anything in the nav buttons while loading
    const isLoading = status === 'loading';

    return (
        <div className="min-h-screen">
            {/* Navigation - Hidden in dashboard */}
            {!isDashboard && (
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                                    {getString('common.appName')}
                                </Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher />
                                {!isLoading && (
                                    <>
                                        {session ? (
                                            <>
                                                <Button asChild>
                                                    <Link href="/dashboard">{getString('common.dashboard')}</Link>
                                                </Button>
                                                <Button asChild variant="outline">
                                                    <Link href="/sign-out">{getString('common.logout')}</Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button asChild variant="outline">
                                                    <Link href="/sign-in">{getString('common.login')}</Link>
                                                </Button>
                                                <Button asChild>
                                                    <Link href="/sign-up">{getString('common.register')}</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Main Content */}
            <main className={!isDashboard ? "pt-16" : undefined}>
                {children}
            </main>
        </div>
    );
} 