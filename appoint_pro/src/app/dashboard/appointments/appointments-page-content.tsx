'use client';

import { useLanguage } from "@/contexts/LanguageContext";
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, ListChecks, Plus } from "lucide-react";

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
    const { getTranslation } = useLanguage();

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={getTranslation('common.appointments')}
                description={getTranslation('common.header.appointments.description')}
                action={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {getTranslation('common.header.appointments.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                {getTranslation('common.timetable')}
                            </CardTitle>
                            <CardDescription>
                                {getTranslation('common.header.timetable.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getTranslation('common.header.timetable.details')}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/appointments/timetable">
                                    {getTranslation('common.view')} {getTranslation('common.timetable')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl flex items-center">
                                <ListChecks className="h-5 w-5 mr-2" />
                                {getTranslation('common.upcomingAppointments')}
                            </CardTitle>
                            <CardDescription>
                                {getTranslation('common.header.upcomingAppointments.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getTranslation('common.header.upcomingAppointments.details')}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/appointments/upcoming">
                                    {getTranslation('common.view')} {getTranslation('common.upcomingAppointments')}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
} 