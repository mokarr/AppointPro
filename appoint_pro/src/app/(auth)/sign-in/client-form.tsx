'use client';

import { authenticate } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Client component for the sign-in form
export default function ClientSignInForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            // Validate form
            if (!email || !password) {
                toast.error('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            toast.loading('Signing in...');

            // Redirect will happen in the server action
            await authenticate(formData);

            // If we reach this code, authentication likely failed but without throwing an error
            router.push('/dashboard');
        } catch (error) {
            console.error('Sign-in error:', error);
            toast.error('Failed to sign in. Please check your credentials.');
        } finally {
            toast.dismiss();
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">
                        Continue with email
                    </span>
                </div>
            </div>

            {/* Email/Password Sign In */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                    name="email"
                    placeholder="Email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                />
                <Input
                    name="password"
                    placeholder="Password"
                    type="password"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className="text-center">
                <Button asChild variant="link">
                    <Link href="/sign-up">Don&apos;t have an account? Sign up</Link>
                </Button>
            </div>
        </div>
    );
} 