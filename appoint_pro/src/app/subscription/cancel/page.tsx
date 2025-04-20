'use client';

import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionCancelPage() {
    return (
        <div className="container max-w-md mx-auto py-20 text-center">
            <div className="rounded-full bg-red-100 p-4 h-24 w-24 mx-auto mb-8">
                <XCircle className="h-full w-full text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Subscription Cancelled</h1>
            <p className="text-muted-foreground mb-8">
                You've cancelled the subscription process. No charges have been made. You can subscribe anytime when you're ready.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild>
                    <Link href="/subscription/plans">View Plans</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
} 