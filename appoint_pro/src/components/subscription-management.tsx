'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Subscription } from '@prisma/client';
import { CreditCard, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/date';
import { useTranslations } from 'next-intl';

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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const router = useRouter();
    const t = useTranslations('subscription');

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

    const handleRefreshStatus = async () => {
        try {
            setIsRefreshing(true);
            setStatusMessage(null);

            const response = await fetch('/api/subscriptions/check-status?forceRefresh=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setStatusMessage(data.message);
                // Refresh the page to get the updated subscription status
                router.refresh();
            } else {
                throw new Error(data.error || 'Failed to refresh subscription status');
            }
        } catch (error) {
            console.error('Error refreshing subscription status:', error);
            setStatusMessage('Failed to refresh subscription status');
        } finally {
            setIsRefreshing(false);
        }
    };

    // If there's no active subscription
    if (!hasActiveSubscription) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {t('manage.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('manage.noActiveSubscription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md bg-amber-50 p-4 mb-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-800">
                                    {t('manage.noActiveSubscriptionMessage')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {statusMessage && (
                        <div className="text-sm text-center mt-4 mb-2 text-muted-foreground">
                            {statusMessage}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:flex-row">
                    <Button
                        onClick={handleRefreshStatus}
                        disabled={isRefreshing}
                        variant="outline"
                        className="w-full"
                    >
                        {isRefreshing ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                {t('manage.loading')}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Status
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? t('manage.loading') : t('manage.viewPlans')}
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
                    {t('manage.title')}
                </CardTitle>
                <CardDescription>
                    {t('manage.currentSubscription', { organizationName })}
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
                                        {t('manage.activeSubscription')}
                                    </p>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        {t('manage.activeSubscriptionMessage', { planName: subscription.planName })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('manage.plan')}</span>
                                <span className="font-medium">{subscription.planName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('manage.status')}</span>
                                <span className="font-medium capitalize">{subscription.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('manage.currentPeriodEnds')}</span>
                                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('manage.cancelAtPeriodEnd')}</span>
                                <span className="font-medium">
                                    {subscription.cancelAtPeriodEnd
                                        ? t('manage.yes')
                                        : t('manage.no')}
                                </span>
                            </div>
                        </div>

                        {statusMessage && (
                            <div className="text-sm text-center mt-4 mb-2 text-muted-foreground">
                                {statusMessage}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p>{t('manage.detailsUnavailable')}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing}
                    variant="outline"
                    className="w-full"
                >
                    {isRefreshing ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {t('manage.loading')}
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Status
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? t('manage.loading') : t('manage.manageButton')}
                </Button>
            </CardFooter>
        </Card>
    );
} 