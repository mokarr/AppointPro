'use server';

import { auth, signIn, signOut } from './auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { validateCsrfToken } from './session';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

/**
 * Server action to authenticate a user with CSRF protection
 */
export async function authenticate(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const csrfToken = formData.get('_csrf') as string;

        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        // Validate CSRF token if available
        if (csrfToken) {
            // Create NextRequest and NextResponse for CSRF validation
            const req = new NextRequest('https://example.com', {
                headers: new Headers({
                    'cookie': cookies().toString(),
                }),
            });
            const res = new NextResponse();

            // Validate the token
            const isValid = await validateCsrfToken(req, res, csrfToken);

            if (!isValid) {
                logger.warn('Invalid CSRF token in authentication attempt', {
                    email,
                    ip: req.headers.get('x-forwarded-for') || 'unknown',
                });
                return { success: false, message: 'Security validation failed' };
            }
        }

        await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        // After successful sign-in, redirect to dashboard
        redirect('/dashboard');

        // This return is technically not reached due to the redirect
        return { success: true };
    } catch (error) {
        console.error('Authentication error:', error);
        if (error instanceof AuthError) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Er is een fout opgetreden bij het inloggen' };
    }
}

/**
 * Server action to get the current user
 */
export async function getCurrentUser() {
    const session = await auth();
    return session?.user;
}

/**
 * Server action to log out the user
 */
export async function logoutUser() {
    await signOut();
    return { success: true };
}

/**
 * Enhanced secure logout function
 * This function properly invalidates sessions and cookies for improved security
 */
export async function secureLogout() {
    try {
        // First, handle server-side session through API
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies
        });

        if (!response.ok) {
            throw new Error('Logout API call failed');
        }

        // Perform client-side NextAuth signOut (for cookie clearing)
        await signOut({ redirect: false });

        // Clear all localStorage items that might contain sensitive data
        localStorage.removeItem('user-preferences');
        localStorage.removeItem('recent-items');

        // Add a small delay to ensure all operations complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to sign-in page
        window.location.href = '/sign-in';

        return { success: true };
    } catch (error) {
        console.error('Secure logout error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during logout'
        };
    }
} 