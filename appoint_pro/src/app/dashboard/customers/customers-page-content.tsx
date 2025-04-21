'use client';

import { useLanguage } from "@/contexts/LanguageContext";
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";

interface Organization {
    id: string;
    name: string;
}

interface CustomersPageContentProps {
    _user: {
        id: string;
        email: string;
        organizationId: string;
        organization: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            subdomain: string | null;
            branche: string;
            stripeCustomerId: string | null;
            hasActiveSubscription: boolean;
        };
    };
    _organization: Organization;
}

export default function CustomersPageContent({ _user, _organization }: CustomersPageContentProps) {
    const { getTranslation } = useLanguage();

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={getTranslation('common.clients')}
                description={getTranslation('common.header.clients.description')}
                action={
                    <Button>
                        {getTranslation('common.header.clients.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            {getTranslation('common.header.clients.overview')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            {getTranslation('common.header.clients.description')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {/* Customer list will be implemented here */}
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {getTranslation('common.header.clients.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
} 