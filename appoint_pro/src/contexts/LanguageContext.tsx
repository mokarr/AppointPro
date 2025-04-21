'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Language = 'nl' | 'en';

// Define a more specific type for translations
export type TranslationValue = string | string[] | { [key: string]: TranslationValue } | { title: string; description: string }[];
type TranslationFile = {
    [key: string]: TranslationValue;
};

interface GetTranslationOptions {
    replacements?: Record<string, string>;
    defaultValue?: string;
}

// Initialize translations as an empty object that will be populated
const translations: Record<Language, TranslationFile> = {
    nl: {},
    en: {},
};

const DEFAULT_LANGUAGE: Language = 'nl';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    getTranslation: (key: string, options?: GetTranslationOptions) => string;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LanguageProviderContent>{children}</LanguageProviderContent>
        </Suspense>
    );
}

function LanguageProviderContent({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Load translations when the component mounts
    useEffect(() => {
        const loadTranslations = async () => {
            try {
                setIsLoading(true);
                const [nlTranslations, enTranslations] = await Promise.all([
                    import('@/locales/nl.json'),
                    import('@/locales/en.json'),
                ]);
                translations.nl = nlTranslations.default;
                translations.en = enTranslations.default;
            } catch (error) {
                console.error('Error loading translations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTranslations();
    }, []);

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

    const getTranslation = (key: string, options: GetTranslationOptions = {}): string => {
        const { replacements = {}, defaultValue = key } = options;
        const keys = key.split('.');
        let value: TranslationValue = translations[language];

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                value = (value as { [key: string]: TranslationValue })[k];
            } else {
                return defaultValue;
            }
        }

        if (typeof value !== 'string') {
            return defaultValue;
        }

        // Handle string replacements
        let result = value;
        Object.entries(replacements).forEach(([key, replacement]) => {
            result = result.replace(`{${key}}`, replacement);
        });

        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, getTranslation, isLoading }}>
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