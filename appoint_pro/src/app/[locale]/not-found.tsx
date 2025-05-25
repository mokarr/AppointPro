'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('common');

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
                    {t('pageNotFound')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                    {t('pageNotFoundDescription')}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    {t('backToHome')}
                </Link>
            </div>
        </div>
    );
}
