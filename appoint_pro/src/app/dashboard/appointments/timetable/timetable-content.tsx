'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, SlotInfo, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/nl'; // Import Dutch locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLanguage } from "@/contexts/LanguageContext";
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarEvent } from '@/types/appointment';
import { Facility, Location } from '@prisma/client';
import { useRouter } from 'next/navigation';
import AppointmentForm, { AppointmentFormValues } from '@/app/dashboard/appointments/timetable/appointment-form';

interface TimeTableContentProps {
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

// Configure moment to use Dutch locale
moment.locale('nl');

// Setup the localizer with Dutch language support
const localizer = momentLocalizer(moment);

// Dutch translations for calendar messages
const dutchMessages = {
    week: 'Week',
    work_week: 'Werkweek',
    day: 'Dag',
    month: 'Maand',
    previous: 'Vorige',
    next: 'Volgende',
    today: 'Vandaag',
    agenda: 'Agenda',
    date: 'Datum',
    time: 'Tijd',
    event: 'Afspraak',
    allDay: 'Hele dag',
    showMore: (total: number) => `+ ${total} meer`,
};

export default function TimeTableContent({ _user, _organization, _locations }: TimeTableContentProps) {
    const { getTranslation } = useLanguage();
    const router = useRouter();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedFacility, setSelectedFacility] = useState<string>('');
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [viewType, setViewType] = useState<View>(Views.WEEK);
    const [currentDate, setCurrentDate] = useState(new Date());

    // New appointment modal state
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [appointmentInitialValues, setAppointmentInitialValues] = useState({
        startTime: '',
        endTime: '',
        locationId: '',
        facilityId: '',
    });

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
                if (location.facilities.length > 0) {
                    setSelectedFacility(location.facilities[0].id);
                } else {
                    setSelectedFacility('');
                }
            }
        }
    }, [selectedLocation, _locations]);

    // Fetch appointments from API - defined with useCallback to prevent recreation on each render
    const fetchAppointments = useCallback(async () => {
        if (!selectedLocation) return;

        let url = `/api/appointments?locationId=${selectedLocation}`;
        if (selectedFacility) {
            url += `&facilityId=${selectedFacility}`;
        }

        // Add date range based on the current view
        const dateRange = getDateRangeForView(viewType, currentDate);
        url += `&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                // Define a type for the booking data from the API
                interface BookingData {
                    id: string;
                    customerName: string;
                    startTime: string;
                    endTime: string;
                    [key: string]: any; // Allow other properties
                }

                // Transform bookings to calendar events
                const calendarEvents: CalendarEvent[] = data.data.map((booking: BookingData) => ({
                    id: booking.id,
                    title: booking.customerName || 'Appointment',
                    start: new Date(booking.startTime),
                    end: new Date(booking.endTime),
                    resource: booking,
                }));

                setEvents(calendarEvents);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    }, [selectedLocation, selectedFacility, viewType, currentDate]);

    // Fetch appointments when filters change
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Helper function to determine date range based on calendar view
    const getDateRangeForView = (view: View, date: Date) => {
        const momentDate = moment(date);

        switch (view) {
            case Views.DAY:
                return {
                    start: momentDate.startOf('day').toDate(),
                    end: momentDate.endOf('day').toDate()
                };
            case Views.WEEK:
                return {
                    start: momentDate.startOf('week').toDate(),
                    end: momentDate.endOf('week').toDate()
                };
            case Views.MONTH:
                return {
                    start: momentDate.startOf('month').toDate(),
                    end: momentDate.endOf('month').toDate()
                };
            default:
                return {
                    start: momentDate.startOf('week').toDate(),
                    end: momentDate.endOf('week').toDate()
                };
        }
    };

    // Handle navigation between calendar views
    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    // Handle changing views (day, week, month)
    const handleViewChange = (newView: View) => {
        setViewType(newView);
    };

    // Handle selecting an appointment to view details
    const handleSelectEvent = (event: CalendarEvent) => {
        router.push(`/dashboard/appointments/${event.id}`);
    };

    // Handle creating a new appointment by selecting a time slot
    const handleSelectSlot = (slotInfo: SlotInfo) => {
        const startTime = new Date(slotInfo.start);
        const endTime = new Date(slotInfo.end);

        // Format times for form
        const formattedStartTime = startTime.toISOString().slice(0, 16);
        const formattedEndTime = endTime.toISOString().slice(0, 16);

        // Set appointment initial values
        setAppointmentInitialValues({
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            locationId: selectedLocation,
            facilityId: selectedFacility,
        });

        // Open the modal
        setIsNewAppointmentModalOpen(true);
    };

    // Handle opening the create appointment modal from button
    const handleCreateAppointmentClick = () => {
        // Calculate default times
        const now = new Date();
        const roundedHour = new Date(now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0));
        const oneHourLater = new Date(roundedHour);
        oneHourLater.setHours(roundedHour.getHours() + 1);

        const formattedStartTime = roundedHour.toISOString().slice(0, 16);
        const formattedEndTime = oneHourLater.toISOString().slice(0, 16);

        // Set appointment initial values
        setAppointmentInitialValues({
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            locationId: selectedLocation,
            facilityId: selectedFacility,
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

            // Refresh appointments
            fetchAppointments();

        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    };

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={getTranslation('common.timetable')}
                description={getTranslation('common.header.timetable.description')}
                action={
                    <Button onClick={handleCreateAppointmentClick}>
                        {getTranslation('common.header.appointments.new')}
                    </Button>
                }
            />

            <DashboardContent>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1 block">
                                {getTranslation('common.location')}
                            </label>
                            <Select
                                value={selectedLocation}
                                onValueChange={setSelectedLocation}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={getTranslation('common.select.location')} />
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

                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1 block">
                                {getTranslation('common.facility')}
                            </label>
                            <Select
                                value={selectedFacility}
                                onValueChange={setSelectedFacility}
                                disabled={facilities.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={getTranslation('common.select.facility')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {facilities.map((facility) => (
                                        <SelectItem key={facility.id} value={facility.id}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="h-[600px]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.DAY, Views.WEEK, Views.MONTH]}
                            view={viewType}
                            onView={handleViewChange}
                            date={currentDate}
                            onNavigate={handleNavigate}
                            defaultDate={new Date()}
                            tooltipAccessor={(event: CalendarEvent) => event.title}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            messages={dutchMessages}
                            culture="nl"
                            selectable
                        />
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