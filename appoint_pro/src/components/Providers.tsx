'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';
import { TranslationLoader } from './TranslationLoader';

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <TranslationLoader>
                    {children}
                    <Toaster />
                </TranslationLoader>
            </LanguageProvider>
        </SessionProvider>
    );
} 