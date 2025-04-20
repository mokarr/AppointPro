'use client';

import * as React from 'react';
import { Calendar, Clock, Users, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

import { Header } from "@/components/header";
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

// Type for location
interface Location {
    id: string;
    name: string;
    address?: string;
    postalCode?: string | null;
    country?: string | null;
    organizationId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Type for employee
interface Employee {
    name: string;
    email: string;
}

// Appointment type to use for our state
interface Appointment {
    id: string;
    title?: string;
    startDateTime: Date;
    endDateTime: Date;
    location: Location;
    Employee: Employee;
    status?: 'confirmed' | 'pending' | 'cancelled';
    client?: {
        name: string;
        email: string;
    };
    bookingId?: string;
}

export default function CustomerPortalDashboard({
    user,
    organization
}: CustomerPortalDashboardProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState({
        appointmentsToday: 0,
        appointmentsThisWeek: 0,
        activeClients: 0,
        openQuotes: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // Fetch appointments
                const appointmentsResult = await getUpcomingAppointments(organization.id);
                if (appointmentsResult.success && appointmentsResult.data) {
                    // Map the data to our expected format with proper type handling
                    const formattedAppointments = appointmentsResult.data.map(app => {
                        // Ensure Employee is never null
                        const employeeData: Employee = app.Employee || {
                            name: "Unassigned",
                            email: ""
                        };

                        return {
                            ...app,
                            title: 'Appointment', // Default title if none provided
                            status: 'confirmed' as const,
                            Employee: employeeData,
                            // Make sure location has required properties
                            location: app.location || {
                                id: "default",
                                name: "Unknown Location"
                            }
                        } as Appointment;
                    });

                    setAppointments(formattedAppointments);
                }

                // Fetch stats
                const statsResult = await getDashboardStats(organization.id);
                if (statsResult.success && statsResult.data) {
                    setStats(statsResult.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [organization.id]);

    const handleCreateAppointment = () => {
        console.log("Create appointment clicked");
    };

    const handleViewAllAppointments = () => {
        console.log("View all appointments clicked");
    };

    // Use dummy data if we don't have real data yet
    const displayAppointments = appointments.length > 0
        ? appointments
        : [
            {
                id: "1",
                title: "Kennismaking met Bedrijf XYZ",
                startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
                endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 25),
                location: { id: "loc1", name: "Hoofdlocatie" },
                Employee: {
                    name: "Jeroen de Vries",
                    email: "jeroen@example.com"
                },
                status: "confirmed" as const,
                client: {
                    name: "Client Name",
                    email: "client@example.com"
                }
            },
            {
                id: "2",
                title: "Product demonstratie",
                startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
                endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 49),
                location: { id: "loc2", name: "Online (Teams)" },
                Employee: {
                    name: "Anna Jansen",
                    email: "anna@example.com"
                },
                status: "pending" as const,
                client: {
                    name: "Another Client",
                    email: "another@example.com"
                }
            }
        ];

    return (
        <DashboardLayout
            header={
                <Header
                    user={user}
                    organization={organization}
                />
            }
        >
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
                        title="Openstaande offertes"
                        value={`€${stats.openQuotes}`}
                        icon={Briefcase}
                        iconColor="warning"
                        trendDirection="down"
                        trendValue="10%"
                        trendLabel="vs vorige maand"
                        variant="warning"
                    />
                </DashboardGrid>

                {/* Upcoming appointments */}
                <DashboardGrid columns={1}>
                    <UpcomingAppointments
                        appointments={displayAppointments}
                        onViewAll={handleViewAllAppointments}
                        isLoading={isLoading}
                    />
                </DashboardGrid>
            </DashboardContent>
        </DashboardLayout>
    );
}