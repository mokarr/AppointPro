'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Types
type CsrfContextType = {
    csrfToken: string | null;
    isLoading: boolean;
    refreshToken: () => Promise<string | null>;
};

// Default context values
const defaultContext: CsrfContextType = {
    csrfToken: null,
    isLoading: true,
    refreshToken: async () => null,
};

// Create context
const CsrfContext = createContext<CsrfContextType>(defaultContext);

// Provider props
interface CsrfProviderProps {
    children: ReactNode;
}

/**
 * CSRF Provider Component
 * 
 * This provider fetches and manages CSRF tokens throughout the application
 * and provides them automatically to authenticated requests.
 */
export function CsrfProvider({ children }: CsrfProviderProps) {
    const { data: session, status } = useSession();
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Function to fetch a new CSRF token
    const fetchCsrfToken = async (): Promise<string | null> => {
        try {
            const response = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            return data.csrfToken || null;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return null;
        }
    };

    // Function to explicitly request a fresh token
    const refreshToken = async (): Promise<string | null> => {
        try {
            setIsLoading(true);

            if (!session) {
                setCsrfToken(null);
                setIsLoading(false);
                return null;
            }

            const response = await fetch('/api/auth/session', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'refresh-csrf',
                    csrfToken: csrfToken
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh CSRF token');
            }

            const data = await response.json();
            const newToken = data.csrfToken || null;
            setCsrfToken(newToken);
            setIsLoading(false);
            return newToken;
        } catch (error) {
            console.error('Error refreshing CSRF token:', error);
            setIsLoading(false);
            return null;
        }
    };

    // Fetch CSRF token when session changes
    useEffect(() => {
        const getInitialToken = async () => {
            setIsLoading(true);

            // Only fetch token if user is authenticated
            if (status === 'authenticated' && session) {
                const token = await fetchCsrfToken();
                setCsrfToken(token);
            } else if (status === 'unauthenticated') {
                setCsrfToken(null);
            }

            setIsLoading(false);
        };

        getInitialToken();
    }, [session, status]);

    // Context value
    const value = {
        csrfToken,
        isLoading,
        refreshToken,
    };

    return (
        <CsrfContext.Provider value={value}>
            {children}
        </CsrfContext.Provider>
    );
}

/**
 * Hook to use CSRF token in components
 */
export function useCsrf() {
    const context = useContext(CsrfContext);

    if (context === undefined) {
        throw new Error('useCsrf must be used within a CsrfProvider');
    }

    return context;
} 