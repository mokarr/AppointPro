'use client';

/**
 * Secure Fetch Client
 * 
 * A wrapper around the fetch API that automatically handles CSRF tokens,
 * authentication, and error handling.
 */

import { useCsrf } from '@/providers/csrf-provider';
import { useState, useCallback, useEffect } from 'react';

// Error types
export type ApiError = {
    status: number;
    message: string;
    details?: any;
};

// Response types
export type ApiResponse<T> = {
    data: T | null;
    error: ApiError | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
};

/**
 * Custom hook for secure data fetching with CSRF protection
 */
export function useSecureFetch<T = any>(url: string, options?: RequestInit): ApiResponse<T> {
    const { csrfToken, refreshToken } = useCsrf();
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Function to perform the fetch operation
    const fetchData = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            // Merge default options with provided options
            const fetchOptions: RequestInit = {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    // Include CSRF token if available
                    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
                },
                ...options,
            };

            // If this is a mutating operation (not GET), ensure CSRF token is included
            if (options?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
                if (!csrfToken) {
                    // Try to refresh the token if it's not available
                    const newToken = await refreshToken();
                    if (newToken) {
                        // Update headers with new token
                        fetchOptions.headers = {
                            ...fetchOptions.headers,
                            'X-CSRF-Token': newToken,
                        };
                    } else {
                        throw new Error('CSRF token is required for this operation');
                    }
                }

                // If the request has a body, include CSRF token in the body as well for additional security
                if (fetchOptions.body && typeof fetchOptions.body === 'string') {
                    try {
                        const bodyData = JSON.parse(fetchOptions.body);
                        const updatedBody = {
                            ...bodyData,
                            _csrf: csrfToken,
                        };
                        fetchOptions.body = JSON.stringify(updatedBody);
                    } catch (e) {
                        // If body is not valid JSON, continue without modifying it
                        console.warn('Could not include CSRF token in request body');
                    }
                }
            }

            // Make the request
            const response = await fetch(url, fetchOptions);

            // Handle different response status codes
            if (response.status === 204) {
                // No content response
                setData(null);
                setIsLoading(false);
                return;
            }

            // Parse JSON response
            const result = await response.json();

            if (!response.ok) {
                // Handle error response
                const apiError: ApiError = {
                    status: response.status,
                    message: result.message || 'An error occurred',
                    details: result.errors || result.error || null,
                };

                // Handle specific error codes
                if (response.status === 401) {
                    // Unauthorized, could redirect to login or handle specially
                    console.warn('Authentication required');
                } else if (response.status === 403) {
                    // Forbidden, could be CSRF or permission error
                    if (result.message?.includes('CSRF')) {
                        // Try to refresh the token and retry once
                        const newToken = await refreshToken();
                        if (newToken) {
                            await fetchData(); // Recursive call to retry with new token
                            return;
                        }
                    }
                    console.warn('Access forbidden');
                } else if (response.status === 429) {
                    // Rate limited
                    console.warn('Rate limited. Please try again later.');
                }

                setError(apiError);
                setData(null);
            } else {
                // Set successful data
                setData(result.data || result);
                setError(null);
            }
        } catch (err) {
            // Handle network or unexpected errors
            console.error('Fetch error:', err);
            setError({
                status: 0,
                message: err instanceof Error ? err.message : 'An unexpected error occurred',
            });
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [url, options, csrfToken, refreshToken]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        error,
        isLoading,
        refetch: fetchData,
    };
}

/**
 * Standalone function for single/one-off secure requests
 */
export async function secureFetch<T = any>(
    url: string,
    options?: RequestInit,
    csrfToken?: string | null
): Promise<T> {
    const fetchOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        ...options,
    };

    // Include CSRF token in body for mutating operations
    if (
        options?.method &&
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) &&
        csrfToken &&
        fetchOptions.body &&
        typeof fetchOptions.body === 'string'
    ) {
        try {
            const bodyData = JSON.parse(fetchOptions.body);
            const updatedBody = {
                ...bodyData,
                _csrf: csrfToken,
            };
            fetchOptions.body = JSON.stringify(updatedBody);
        } catch (e) {
            // If body is not valid JSON, continue without modifying it
        }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
            status: response.status,
            message: errorData.message || 'An error occurred',
            details: errorData.errors || errorData.error || null,
        };
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
} 