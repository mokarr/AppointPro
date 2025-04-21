'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@prisma/client';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { getTranslation } = useLanguage();

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
                        {getTranslation('subscription.manage.title')}
                    </CardTitle>
                    <CardDescription>
                        {getTranslation('subscription.manage.noActiveSubscription', { replacements: { organizationName } })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md bg-amber-50 p-4 mb-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-800">
                                    {getTranslation('subscription.manage.noActiveSubscriptionMessage')}
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
                        {isLoading ? getTranslation('subscription.manage.loading') : getTranslation('subscription.manage.viewPlans')}
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
                    {getTranslation('subscription.manage.title')}
                </CardTitle>
                <CardDescription>
                    {getTranslation('subscription.manage.currentSubscription', { replacements: { organizationName } })}
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
                                        {getTranslation('subscription.manage.activeSubscription')}
                                    </p>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        {getTranslation('subscription.manage.activeSubscriptionMessage', { replacements: { planName: subscription.planName } })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{getTranslation('subscription.manage.plan')}</span>
                                <span className="font-medium">{subscription.planName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{getTranslation('subscription.manage.status')}</span>
                                <span className="font-medium capitalize">{subscription.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{getTranslation('subscription.manage.currentPeriodEnds')}</span>
                                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{getTranslation('subscription.manage.cancelAtPeriodEnd')}</span>
                                <span className="font-medium">
                                    {subscription.cancelAtPeriodEnd
                                        ? getTranslation('subscription.manage.yes')
                                        : getTranslation('subscription.manage.no')}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p>{getTranslation('subscription.manage.detailsUnavailable')}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? getTranslation('subscription.manage.loading') : getTranslation('subscription.manage.manageButton')}
                </Button>
            </CardFooter>
        </Card>
    );
} 