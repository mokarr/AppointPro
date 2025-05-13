'use server';

import { auth, signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/zod";

/**
 * Server action to authenticate a user
 */
export async function authenticate(formData: FormData) {
    try {
        const loginObject = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        };

        const { email, password } = await signInSchema.parseAsync(loginObject);
        console.log(email, password);

        await signIn('credentials', {
            email: email,
            password: password,
            redirect: false
        });
    
    } catch (error) {
        console.log(error);

        if (error instanceof AuthError) {
            return { success: false, message: error.message };
        }
        
        // Check if it's a validation error (ZodError)
        if (error instanceof Error && error.message.includes("Password must be more than 8 characters")) {
            return { success: false, message: 'Password must be at least 8 characters' };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }

     // After successful sign-in, redirect to dashboard
     redirect('/dashboard');
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