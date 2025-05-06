'use client';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('error');

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">{t('notFound.title')}</h1>
            <p>{t('notFound.description')}</p>
        </div>
    );
}
