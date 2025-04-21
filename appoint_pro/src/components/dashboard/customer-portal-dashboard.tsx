'use client';

import * as React from 'react';
import { Calendar, Clock, Users, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

import {
    DashboardContent,
    DashboardGrid,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getUpcomingAppointments } from "@/services/api-utils";

// Define the props type for our component
interface CustomerPortalDashboardProps {
    user: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        organizationId: string;
    };
    organization: {
        id: string;
        name: string;
        branche: string;
        description: string;
    };
}

interface DashboardStats {
    appointmentsToday: number;
    appointmentsThisWeek: number;
    activeClients: number;
    revenue: number;
}

interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    client: {
        name: string;
        email: string;
    };
    service: {
        name: string;
        duration: number;
    };
}

export default function CustomerPortalDashboard({
    user,
    organization
}: CustomerPortalDashboardProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        appointmentsToday: 0,
        appointmentsThisWeek: 0,
        activeClients: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard statistics
                const dashboardStats = await getDashboardStats(user.organizationId);
                setStats(dashboardStats);

                // Fetch upcoming appointments
                const upcomingAppointments = await getUpcomingAppointments(user.organizationId);
                setAppointments(upcomingAppointments);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Handle error appropriately
            }
        };

        fetchDashboardData();
    }, [user.organizationId]);

    const handleCreateAppointment = () => {
        // Implement appointment creation logic
        console.log('Create appointment clicked');
    };

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={`Welkom bij ${organization.name}`}
                description="Bekijk hier een overzicht van uw organisatie"
                action={
                    <Button onClick={handleCreateAppointment}>Nieuwe afspraak</Button>
                }
            />

            <DashboardContent>
                {/* Statistics */}
                <DashboardGrid columns={4}>
                    <StatsCard
                        title="Afspraken vandaag"
                        value={stats.appointmentsToday}
                        icon={Calendar}
                        iconColor="primary"
                        trendDirection="up"
                        trendValue="20%"
                        trendLabel="vs vorige week"
                        variant="primary"
                    />
                    <StatsCard
                        title="Afspraken komende week"
                        value={stats.appointmentsThisWeek}
                        icon={Clock}
                        iconColor="secondary"
                        trendDirection="up"
                        trendValue="5%"
                        trendLabel="vs vorige week"
                        variant="secondary"
                    />
                    <StatsCard
                        title="Actieve klanten"
                        value={stats.activeClients}
                        icon={Users}
                        iconColor="accent"
                        trendDirection="neutral"
                        trendValue="0%"
                        trendLabel="geen verandering"
                        variant="accent"
                    />
                    <StatsCard
                        title="Omzet deze maand"
                        value={stats.revenue}
                        icon={Briefcase}
                        iconColor="success"
                        trendDirection="up"
                        trendValue="12%"
                        trendLabel="vs vorige maand"
                        variant="success"
                        valuePrefix="€"
                    />
                </DashboardGrid>

                {/* Upcoming Appointments */}
                <div className="mt-6">
                    <UpcomingAppointments appointments={appointments} />
                </div>
            </DashboardContent>
        </DashboardLayout>
    );
}