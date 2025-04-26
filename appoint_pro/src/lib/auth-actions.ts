'use server';

import { auth, signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

/**
 * Server action to authenticate a user
 */
export async function authenticate(formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
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