'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifySubscription = async () => {
            try {
                if (!sessionId) {
                    setError('No session ID found');
                    setIsLoading(false);
                    return;
                }

                // Wait a moment to allow Stripe webhook to process the subscription
                await new Promise(resolve => setTimeout(resolve, 3000));
                setIsLoading(false);
            } catch (error) {
                console.error('Error verifying subscription:', error);
                setError('Failed to verify subscription');
                setIsLoading(false);
            }
        };

        verifySubscription();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="container max-w-md mx-auto py-20 text-center">
                <div className="animate-pulse">
                    <div className="rounded-full bg-emerald-100 p-4 h-24 w-24 mx-auto mb-8">
                        <div className="h-full w-full rounded-full bg-emerald-200"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                    <div className="h-10 bg-gray-200 rounded-md w-32 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-md mx-auto py-20 text-center">
                <div className="text-red-500 text-5xl mb-8">⚠️</div>
                <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                <p className="text-muted-foreground mb-8">{error}</p>
                <Button asChild>
                    <Link href="/subscription/plans">Back to plans</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-md mx-auto py-20 text-center">
            <div className="rounded-full bg-emerald-100 p-4 h-24 w-24 mx-auto mb-8">
                <CheckCircle className="h-full w-full text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
            <p className="text-muted-foreground mb-8">
                Thank you for subscribing. Your subscription has been activated, and you now have full access to all features.
            </p>
            <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
} 