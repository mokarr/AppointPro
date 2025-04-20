'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@prisma/client';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date';

interface SubscriptionManagementProps {
    subscription?: Subscription | null;
    hasActiveSubscription: boolean;
    organizationName: string;
}

export default function SubscriptionManagement({
    subscription,
    hasActiveSubscription,
    organizationName,
}: SubscriptionManagementProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleManageSubscription = async () => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/subscriptions/create-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.url) {
                router.push(data.url);
            } else {
                throw new Error('Failed to create portal session');
            }
        } catch (error) {
            console.error('Error creating portal session:', error);
            alert('Failed to access billing portal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = () => {
        router.push('/subscription/plans');
    };

    // If there's no active subscription
    if (!hasActiveSubscription) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription
                    </CardTitle>
                    <CardDescription>
                        No active subscription found for {organizationName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md bg-amber-50 p-4 mb-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-800">
                                    Your organization doesn't have an active subscription.
                                    Subscribe to access all features.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Loading...' : 'View Subscription Plans'}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription
                </CardTitle>
                <CardDescription>
                    Current subscription for {organizationName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {subscription ? (
                    <div className="space-y-4">
                        <div className="rounded-md bg-emerald-50 p-4">
                            <div className="flex items-start">
                                <Check className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-800">
                                        Active Subscription
                                    </p>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        Your {subscription.planName} subscription is active and will renew automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-medium">{subscription.planName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium capitalize">{subscription.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Current period ends</span>
                                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Cancel at period end</span>
                                <span className="font-medium">{subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p>Subscription details unavailable</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Loading...' : 'Manage Subscription'}
                </Button>
            </CardFooter>
        </Card>
    );
} 