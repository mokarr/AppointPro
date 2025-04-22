'use client';

import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface TranslationLoaderProps {
    children: React.ReactNode;
}

export function TranslationLoader({ children }: TranslationLoaderProps) {
    const { isLoading } = useLanguage();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Add a small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!isReady) {
        return (
            <div data-cy="translation-loader" className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading translations...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 