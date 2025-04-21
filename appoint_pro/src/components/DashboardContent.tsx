'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Session } from 'next-auth';

interface DashboardContentProps {
    session: Session;
}

export default function DashboardContent({ session }: DashboardContentProps) {
    const { getTranslation } = useLanguage();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = getTranslation(key);
        return typeof value === 'string' ? value : '';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {getString('dashboard.welcome')}, {session.user?.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {getString('dashboard.description')}
                    </p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Button asChild className="w-full">
                            <Link href="/appointments/new">
                                {getString('dashboard.newAppointment')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/customers">
                                {getString('dashboard.manageCustomers')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/settings">
                                {getString('dashboard.manageSettings')}
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                {getString('dashboard.stats.appointments')}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {getString('dashboard.stats.customers')}
                            </h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                                {getString('dashboard.stats.revenue')}
                            </h3>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">€0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 