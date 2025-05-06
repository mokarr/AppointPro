'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from '@/types/appointment';
import { Facility, Location } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, isSameDay, startOfDay, endOfDay, parseISO, isAfter, isBefore, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarIcon, UserIcon, MapPinIcon, PhoneIcon, MailIcon, BuildingIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import AppointmentForm from '@/app/[locale]/dashboard/appointments/timetable/appointment-form';
import { toast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';

// Define type for form values based on AppointmentForm
type AppointmentFormValues = {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    startTime: string;
    endTime: string;
    locationId: string;
    facilityId: string;
};

interface UpcomingAppointmentsContentProps {
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
    _organization: {
        id: string;
        name: string;
    };
    _locations: (Location & {
        facilities: Facility[];
    })[];
}

export default function UpcomingAppointmentsContent({ _user, _organization, _locations }: UpcomingAppointmentsContentProps) {
    const t = useTranslations('common');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Date selection for date carousel
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [dateRange, setDateRange] = useState<Date[]>([]);

    // New appointment modal state
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [appointmentInitialValues, setAppointmentInitialValues] = useState({
        startTime: '',
        endTime: '',
        locationId: '',
        facilityId: ''
    });

    // Initialize date range for carousel (7 days starting from today)
    useEffect(() => {
        const today = new Date();
        const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
        setDateRange(dates);
    }, []);

    // Set defaults for filters if data is available
    useEffect(() => {
        if (_locations.length > 0 && !selectedLocation) {
            setSelectedLocation(_locations[0].id);
            setFacilities(_locations[0].facilities);
        }
    }, [_locations, selectedLocation]);

    // When location changes, update facilities
    useEffect(() => {
        if (selectedLocation) {
            const location = _locations.find(loc => loc.id === selectedLocation);
            if (location) {
                setFacilities(location.facilities);
            }
        }
    }, [selectedLocation, _locations]);

    // Function to fetch appointments - defined with useCallback to prevent recreation on each render
    const fetchAppointments = useCallback(async () => {
        if (!selectedLocation) return;

        setIsLoading(true);

        // Set date boundaries for selected date (start and end of day)
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);

        const url = `/api/appointments?locationId=${selectedLocation}&startDate=${dayStart.toISOString()}&endDate=${dayEnd.toISOString()}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedLocation, selectedDate]);

    // Fetch appointments when filters change
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Helper function to format date and time
    const formatDate = (date: Date) => {
        return format(new Date(date), 'EEEE d MMMM', { locale: nl });
    };

    const formatTime = (date: Date) => {
        return format(new Date(date), 'HH:mm');
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
        }
    };

    // Get location name from ID
    const getLocationName = (locationId: string) => {
        const location = _locations.find(loc => loc.id === locationId);
        return location ? location.name : '';
    };

    // Get facility name from ID
    const getFacilityName = (facilityId: string) => {
        for (const location of _locations) {
            const facility = location.facilities.find(fac => fac.id === facilityId);
            if (facility) return facility.name;
        }
        return '';
    };

    // Group appointments by facility
    const getAppointmentsByFacility = () => {
        const facilityMap = new Map<string, Appointment[]>();

        // Initialize with all facilities from the selected location
        facilities.forEach(facility => {
            facilityMap.set(facility.id, []);
        });

        // Add appointments to their respective facilities
        appointments.forEach(appointment => {
            const facilityId = appointment.facilityId;
            if (facilityMap.has(facilityId)) {
                facilityMap.get(facilityId)?.push(appointment);
            } else {
                facilityMap.set(facilityId, [appointment]);
            }
        });

        return facilityMap;
    };

    // Move carousel to next/previous day
    const handleNextDays = () => {
        const newDates = dateRange.map(date => addDays(date, 7));
        setDateRange(newDates);
    };

    const handlePreviousDays = () => {
        const newDates = dateRange.map(date => addDays(date, -7));
        setDateRange(newDates);
    };

    // Format date for carousel
    const formatCarouselDate = (date: Date) => {
        const isCurrentDay = isToday(date);
        const dayName = format(date, 'EEE', { locale: nl });
        const dayNumber = format(date, 'd', { locale: nl });
        const monthAbbr = format(date, 'MMM', { locale: nl });

        return (
            <div className="text-center">
                <div className="text-sm font-medium">{isCurrentDay ? 'Vandaag' : dayName}</div>
                <div className="text-lg font-bold">{dayNumber}</div>
                <div className="text-xs mt-0.5">{monthAbbr}</div>
            </div>
        );
    };

    // Handle opening the create appointment modal
    const handleCreateAppointmentClick = () => {
        if (!selectedLocation || facilities.length === 0) {
            toast({
                title: t("error"),
                description: t("selectLocationFirst"),
                variant: "destructive"
            });
            return;
        }

        // Calculate default times based on selected date
        const startDateTime = new Date(selectedDate);
        // Round to the nearest half hour
        startDateTime.setMinutes(Math.ceil(startDateTime.getMinutes() / 30) * 30, 0, 0);

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1); // 1 hour appointment by default

        const formattedStartTime = startDateTime.toISOString().slice(0, 16);
        const formattedEndTime = endDateTime.toISOString().slice(0, 16);

        // Set appointment initial values
        setAppointmentInitialValues({
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            locationId: selectedLocation,
            facilityId: facilities[0].id // Default to first facility
        });

        // Open the modal
        setIsNewAppointmentModalOpen(true);
    };

    // Handle closing the appointment modal
    const handleCloseAppointmentModal = () => {
        setIsNewAppointmentModalOpen(false);
    };

    // Handle appointment form submission
    const handleAppointmentSubmit = async (values: AppointmentFormValues) => {
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: values.customerName,
                    ...values
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create appointment');
            }

            // Close the modal
            setIsNewAppointmentModalOpen(false);

            // Show success toast
            toast({
                title: t("success"),
                description: t("appointmentCreated"),
            });

            // Refresh appointments
            fetchAppointments();

        } catch (error) {
            console.error('Error creating appointment:', error);

            // Show error toast
            toast({
                title: t("error"),
                description: t("appointmentCreateFailed"),
                variant: "destructive"
            });

            throw error;
        }
    };

    const appointmentsByFacility = getAppointmentsByFacility();

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t('upcomingAppointments')}
                description={t('header.upcomingAppointments.description')}
                action={
                    <Button onClick={handleCreateAppointmentClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('header.appointments.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                    {/* Location selector */}
                    <div className="mb-6">
                        <label className="text-sm font-medium mb-1 block">
                            {t('location')}
                        </label>
                        <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('select.location')} />
                            </SelectTrigger>
                            <SelectContent>
                                {_locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date carousel */}
                    <div className="border rounded-lg py-4 px-2 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreviousDays}
                                className="px-2"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <div
                                className="flex-1 overflow-x-auto"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}
                            >
                                <style jsx>{`
                                    div::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                                <div className="flex justify-between min-w-full px-4">
                                    {dateRange.map((date, index) => {
                                        const isPastDay = isBefore(date, startOfDay(new Date())) && !isToday(date);

                                        return (
                                            <Button
                                                key={index}
                                                variant={isSameDay(date, selectedDate) ? "default" : "ghost"}
                                                className={cn(
                                                    "flex-col h-20 rounded-md mx-1 min-w-16",
                                                    isSameDay(date, selectedDate)
                                                        ? "bg-primary text-primary-foreground border-2 border-primary shadow-md transform scale-105"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                                                    isPastDay && "opacity-60 text-gray-500 dark:text-gray-400"
                                                )}
                                                onClick={isSameDay(date, selectedDate) ? undefined : () => setSelectedDate(date)}
                                                style={isSameDay(date, selectedDate) ? { pointerEvents: 'none' } : undefined}
                                            >
                                                {formatCarouselDate(date)}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNextDays}
                                className="px-2"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h2 className="text-xl font-semibold mb-4">
                            {formatDate(selectedDate)}
                        </h2>

                        {isLoading ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('loading')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {facilities.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                        {t('noFacilitiesFound')}
                                    </p>
                                ) : (
                                    Array.from(appointmentsByFacility.entries()).map(([facilityId, facilityAppointments]) => {
                                        const facility = facilities.find(f => f.id === facilityId);
                                        if (!facility) return null;

                                        return (
                                            <div key={facilityId} className="border rounded-lg overflow-hidden">
                                                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
                                                    <h3 className="font-medium text-lg">{facility.name}</h3>
                                                </div>

                                                {facilityAppointments.length === 0 ? (
                                                    <div className="p-6 text-center">
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {t('noAppointmentsFound')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y">
                                                        {facilityAppointments
                                                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                                            .map(appointment => (
                                                                <Link
                                                                    href={`/dashboard/appointments/${appointment.id}`}
                                                                    key={appointment.id}
                                                                    className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                                >
                                                                    <div className="flex items-center justify-between p-4">
                                                                        <div className="flex items-center space-x-4">
                                                                            <div className="font-medium">
                                                                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                                                                            </div>
                                                                            <div>
                                                                                {appointment.customerName}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <Badge className={getStatusBadgeColor(appointment.status)}>
                                                                                {appointment.status}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardContent>

            {/* Appointment Form Component */}
            <AppointmentForm
                isOpen={isNewAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                onSubmit={handleAppointmentSubmit}
                locations={_locations}
                initialValues={appointmentInitialValues}
            />
        </DashboardLayout>
    );
} 