'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Session } from 'next-auth';
import SubscriptionManagement from '@/components/subscription-management';
import type { Subscription } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// Define a type for the Cypress test data that might be injected
interface CypressTestData {
    organization?: {
        name: string;
        hasActiveSubscription: boolean;
    };
    subscription?: Subscription | null;
}

// Extend the Window interface to include our test data property
declare global {
    interface Window {
        cypressTestData?: CypressTestData;
    }
}

interface DashboardContentProps {
    session: Session;
    organization: {
        name: string;
        hasActiveSubscription: boolean;
    };
    subscription?: Subscription | null;
}

export default function DashboardContent({ session, organization: initialOrganization, subscription: initialSubscription }: DashboardContentProps) {
    const t = useTranslations('dashboard');
    const [organization, setOrganization] = useState(initialOrganization);
    const [subscription, setSubscription] = useState(initialSubscription);



    // Use Cypress test data if available (for testing purposes only)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.cypressTestData) {
            console.log('Using Cypress test data for testing');
            if (window.cypressTestData.organization) {
                setOrganization(window.cypressTestData.organization);
            }
            if ('subscription' in window.cypressTestData) {
                setSubscription(window.cypressTestData.subscription);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('welcome')}, {session.user?.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {t('description')}
                    </p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Button asChild className="w-full">
                            <Link href="/appointments/new">
                                {t('newAppointment')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/customers">
                                {t('manageCustomers')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/settings">
                                {t('manageSettings')}
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                {t('stats.appointments')}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {t('stats.customers')}
                            </h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">0</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                                {t('stats.revenue')}
                            </h3>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">€0</p>
                        </div>
                    </div>
                </div>

                {/* Subscription Management Section */}
                <div className="mb-6" id="subscription-management-section">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('subscriptionSection')}
                    </h2>
                    <SubscriptionManagement
                        subscription={subscription}
                        hasActiveSubscription={organization.hasActiveSubscription}
                        organizationName={organization.name}
                    />
                </div>
            </div>
        </div>
    );
} 