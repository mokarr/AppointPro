// app/not-found.tsx

'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
    const { getTranslation } = useLanguage();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = getTranslation(key);
        return typeof value === 'string' ? value : '';
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">{getString('error.notFound.title')}</h1>
            <p>{getString('error.notFound.description')}</p>
        </div>
    );
}
