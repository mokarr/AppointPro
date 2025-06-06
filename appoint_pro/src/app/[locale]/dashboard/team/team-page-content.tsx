'use client';

import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import type { User } from "@prisma/client";
import { useTranslations } from "next-intl";

interface Organization {
    id: string;
    name: string;
}

interface TeamPageContentProps {
    _user: User;
    _organization: Organization;
}

export default function TeamPageContent({ _user, _organization }: TeamPageContentProps) {
    const t = useTranslations('common');

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t('team')}
                description={t('header.team.description')}
                action={
                    <Button>
                        {t('header.team.add')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                            {t('header.team.overview')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            {t('header.team.description')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {/* Team members will be implemented here */}
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('header.team.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
} 