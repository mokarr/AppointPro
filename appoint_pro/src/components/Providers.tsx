'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { CsrfProvider } from '@/providers/csrf-provider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'sonner';
import { TranslationLoader } from './TranslationLoader';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <CsrfProvider>
                    <LanguageProvider>
                        <TranslationLoader>
                            {children}
                            <Toaster position="bottom-right" />
                        </TranslationLoader>
                    </LanguageProvider>
                </CsrfProvider>
            </ThemeProvider>
        </SessionProvider>
    );
} 