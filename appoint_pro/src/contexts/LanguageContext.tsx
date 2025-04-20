'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Language = 'nl' | 'en';

type TranslationKey = string;
type TranslationValue = string | string[] | { [key: string]: TranslationValue };
type Translations = {
    [key: string]: TranslationValue;
};

const translations: Record<Language, Translations> = {
    nl: require('@/locales/nl.json'),
    en: require('@/locales/en.json'),
};

const DEFAULT_LANGUAGE: Language = 'nl';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => TranslationValue;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const langParam = searchParams.get('lang') as Language | null;
        if (langParam && ['nl', 'en'].includes(langParam)) {
            setLanguage(langParam);
        }
    }, [searchParams]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);

        // Create new URL with updated query parameters
        const params = new URLSearchParams(searchParams.toString());
        params.set('lang', lang);

        // Keep the current pathname but update the query parameter
        router.push(`${pathname}?${params.toString()}`);
    };

    const t = (key: string): TranslationValue => {
        const keys = key.split('.');
        let value: TranslationValue = translations[language];

        for (const k of keys) {
            if (typeof value === 'object' && value !== null) {
                value = (value as { [key: string]: TranslationValue })[k];
            } else {
                return key;
            }
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}; 