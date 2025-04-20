'use client';

import { useState } from 'react';
import { authenticate } from '@/lib/auth-actions';
import { signIn as clientSignIn } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            // Use server action for authentication
            const result = await authenticate(formData);

            if (result.success) {
                // Use client-side redirect after successful auth
                router.push('/portal');
            } else {
                toast.error(result.message || 'Authentication failed');
            }
        } catch (error) {
            toast.error('An error occurred during sign in');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Email
                <input name="email" type="email" required />
            </label>
            <label>
                Password
                <input name="password" type="password" required />
            </label>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>
    );
}