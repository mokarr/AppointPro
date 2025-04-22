'use client';

import React, { FormEvent, useMemo } from 'react';
import { useCsrf } from '@/providers/csrf-provider';

interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
    action?: string;
    method?: string;
}

/**
 * SecureForm Component
 * 
 * A form component that automatically includes CSRF protection
 * for all form submissions. It works with both standard form submissions
 * and JavaScript-handled submissions.
 */
export function SecureForm({
    children,
    onSubmit,
    action,
    method = 'post',
    ...props
}: SecureFormProps) {
    const { csrfToken, isLoading } = useCsrf();

    // Generate a unique form ID for this form instance
    const formId = useMemo(() => `secure-form-${Math.random().toString(36).substring(2, 9)}`, []);

    // Handle form submission
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        // If onSubmit is provided, let the parent component handle the submission
        if (onSubmit) {
            onSubmit(e);
            return;
        }

        // If no onSubmit handler is provided and we're doing a standard form submission,
        // make sure we don't submit if we're still loading the CSRF token
        if (isLoading) {
            e.preventDefault();
            console.warn('CSRF token is still loading. Please try again.');
        }
    };

    return (
        <form
            id={formId}
            method={method}
            action={action}
            onSubmit={handleSubmit}
            {...props}
        >
            {/* Hidden CSRF token field */}
            {csrfToken && (
                <input
                    type="hidden"
                    name="_csrf"
                    value={csrfToken}
                    aria-hidden="true"
                />
            )}

            {/* Render loading state if CSRF token is still loading */}
            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading security token...</div>
            ) : (
                children
            )}
        </form>
    );
}

/**
 * SecureFormSubmit Component
 * 
 * A button component specifically designed for use within SecureForm
 * that handles the loading state of the CSRF token.
 */
export function SecureFormSubmit({
    children,
    disabled,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { isLoading } = useCsrf();

    return (
        <button
            type="submit"
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
} 