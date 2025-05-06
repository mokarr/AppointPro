'use client';


import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, ListChecks, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface Organization {
    id: string;
    name: string;
}

interface AppointmentsPageContentProps {
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

export default function AppointmentsPageContent({ _user, _organization }: AppointmentsPageContentProps) {
    const t = useTranslations('common');

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t('appointments')}
                description={t('header.appointments.description')}
                action={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('header.appointments.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                {t('timetable')}
                            </CardTitle>
                            <CardDescription>
                                {t('header.timetable.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('header.timetable.details')}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/appointments/timetable">
                                    {t('view')} {t('timetable')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center">
                                <ListChecks className="h-5 w-5 mr-2" />
                                {t('upcomingAppointments')}
                            </CardTitle>
                            <CardDescription>
                                {t('header.upcomingAppointments.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('header.upcomingAppointments.details')}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/appointments/upcoming">
                                    {t('view')} {t('upcomingAppointments')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
} 