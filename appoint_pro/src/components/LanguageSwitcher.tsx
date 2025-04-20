'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
    const { language, setLanguage, t } = useLanguage();

    // Helper function to safely convert TranslationValue to string
    const getString = (key: string): string => {
        const value = t(key);
        return typeof value === 'string' ? value : '';
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => setLanguage('nl')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${language === 'nl'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                aria-label={getString('common.switchToDutch')}
            >
                NL
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${language === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                aria-label={getString('common.switchToEnglish')}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher; 