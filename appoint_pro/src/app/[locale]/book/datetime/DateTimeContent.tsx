'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addDays, addMinutes, isAfter, isBefore, isSameDay, setHours, setMinutes, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, ArrowLeft, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Skeleton } from "@/components/ui/skeleton";
import OrganizationWithSettings from '@/models/Settings/OganizationWithSettings';

// Available duration options in minutes
const DURATION_OPTIONS = [
    { value: 30, label: '30 minuten' },
    { value: 60, label: '1 uur' },
    { value: 90, label: '1 uur 30 minuten' },
    { value: 120, label: '2 uur' },
    { value: 180, label: '3 uur' },
    { value: 240, label: '4 uur' },
];

// Add person count options
const PERSON_COUNT_OPTIONS = [
    { value: 1, label: '1 persoon' },
    { value: 2, label: '2 personen' },
    { value: 3, label: '3 personen' },
    { value: 4, label: '4 personen' },
    { value: 5, label: '5 personen' },
    { value: 6, label: '6 personen' },
    { value: 7, label: '7 personen' },
    { value: 8, label: '8 personen' },
];

// Interface matching the API response
interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    classSessionId?: string;
}

interface DateTimeContentProps {
    organization: OrganizationWithSettings;
    primaryColor: string;
    secondaryColor: string;
    locationId: string;
    facilityId: string;
    classId: string;
    isClassBooking: boolean;
}

export default function DateTimeContent({ 
    organization, 
    primaryColor, 
    secondaryColor,
    locationId,
    facilityId,
    classId,
    isClassBooking
}: DateTimeContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(60);
    const [selectedPersonCount, setSelectedPersonCount] = useState<number>(1);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoadingDates, setIsLoadingDates] = useState(false);

    // UI state for accordion sections
    const [dateExpanded, setDateExpanded] = useState(true);
    const [timeExpanded, setTimeExpanded] = useState(false);

    // Fetch available dates for class bookings
    useEffect(() => {
        if (isClassBooking) {
            const fetchAvailableDates = async () => {
                setIsLoadingDates(true);
                try {
                    const response = await fetch(`/api/class/dates?classId=${classId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch available dates');
                    }
                    const dates = await response.json();
                    setAvailableDates(dates);
                } catch (error) {
                    console.error('Error fetching available dates:', error);
                    setAvailableDates([]);
                } finally {
                    setIsLoadingDates(false);
                }
            };

            fetchAvailableDates();
        }
    }, [isClassBooking, classId]);

    // Redirect if missing required parameters
    useEffect(() => {
        if (!locationId || (!facilityId && !classId)) {
            router.push('/book');
        }
    }, [locationId, facilityId, classId, router]);

    // Fetch available time slots when date or duration changes
    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimeSlots([]);
            return;
        }

        const fetchAvailableTimeSlots = async () => {
            setIsLoadingTimeSlots(true);
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                let url = '';
                
                if (isClassBooking) {
                    url = `/api/timeslots/class?classId=${classId}&date=${formattedDate}`;
                } else {
                    url = `/api/timeslots?facilityId=${facilityId}&date=${formattedDate}&duration=${selectedDuration}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch available time slots');
                }

                const data = await response.json();
                setAvailableTimeSlots(data);

                // Reset selected time when available slots change
                setSelectedTime(null);

                // Auto expand time section when date is selected and slots are loaded
                setTimeExpanded(true);
                setDateExpanded(false);
            } catch (error) {
                console.error('Error fetching available time slots:', error);
                setAvailableTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        fetchAvailableTimeSlots();
    }, [selectedDate, selectedDuration, facilityId, classId, isClassBooking]);

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) return;

        setIsLoading(true);

        // Find the selected time slot to get the end time and classSessionId
        const selectedSlot = availableTimeSlots.find(slot => slot.startTime === selectedTime);
        if (!selectedSlot) {
            setIsLoading(false);
            return;
        }

        // Format date and times for passing as parameters
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const startDateTime = `${formattedDate}T${selectedTime}`;
        const endDateTime = `${formattedDate}T${selectedSlot.endTime}`;

        // Create URL with all necessary parameters
        let confirmationUrl = '';
        if (isClassBooking) {
            confirmationUrl = `/book/confirmation?locationId=${locationId}&classId=${classId}&classSessionId=${selectedSlot.classSessionId}&dateTime=${startDateTime}&endDateTime=${endDateTime}&personCount=${selectedPersonCount}`;
        } else {
            confirmationUrl = `/book/confirmation?locationId=${locationId}&facilityId=${facilityId}&dateTime=${startDateTime}&endDateTime=${endDateTime}&duration=${selectedDuration}&personCount=${selectedPersonCount}`;
        }

        // Navigate to confirmation page
        router.push(confirmationUrl);
    };

    const formatDateHeader = (date: Date) => {
        return format(date, 'EEEE d MMMM yyyy', { locale: nl });
    };

    const handleDurationChange = (value: string) => {
        setSelectedDuration(parseInt(value));
        setSelectedTime(null); // Reset time selection when duration changes
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
    };

    const toggleDateSection = () => {
        if (!dateExpanded && selectedDate) {
            setDateExpanded(true);
            setTimeExpanded(false);
        }
    };

    const toggleTimeSection = () => {
        if (!timeExpanded && selectedDate) {
            setTimeExpanded(true);
            setDateExpanded(false);
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        // Collapse time section after selection
        setTimeExpanded(false);
    };

    // Filter only available time slots
    const availableTimes = availableTimeSlots.filter(slot => slot.isAvailable);

    const isDateAvailable = (date: Date) => {
        if (!isClassBooking) {
            // For facility bookings, only check if date is in the future
            return isAfter(date, new Date()) || isSameDay(date, new Date());
        }

        // For class bookings, check if the date is in the available dates list
        const dateString = format(date, 'yyyy-MM-dd');
        return availableDates.includes(dateString);
    };

    const handlePersonCountChange = (value: string) => {
        setSelectedPersonCount(parseInt(value));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6" style={{ color: primaryColor }}>Kies een datum en tijd</h2>

            {/* Back Button */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Terug naar {isClassBooking ? 'lessen' : 'faciliteiten'}
                </Button>
            </div>

            {/* Person Count Section */}
            <Card className="mb-4">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Aantal personen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        onValueChange={handlePersonCountChange}
                        defaultValue={selectedPersonCount.toString()}
                    >
                        <SelectTrigger id="personCount" className="w-full">
                            <SelectValue placeholder="Selecteer aantal personen" />
                        </SelectTrigger>
                        <SelectContent>
                            {PERSON_COUNT_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Duration Section - Only visible for facility bookings */}
            {!isClassBooking && (
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            Selecteer Duur
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            onValueChange={handleDurationChange}
                            defaultValue={selectedDuration.toString()}
                        >
                            <SelectTrigger id="duration" className="w-full">
                                <SelectValue placeholder="Selecteer duur" />
                            </SelectTrigger>
                            <SelectContent>
                                {DURATION_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {/* Date Selection Section */}
            <Card className="mb-4">
                <CardHeader
                    className={`pb-2 flex flex-row items-center justify-between cursor-pointer ${selectedDate ? 'border-b' : ''}`}
                    onClick={toggleDateSection}
                >
                    <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        <div>
                            <CardTitle className="text-base">
                                {selectedDate ? 'Geselecteerde Datum' : 'Kies een Datum'}
                            </CardTitle>
                            {selectedDate && !dateExpanded && (
                                <CardDescription className="mt-1">
                                    {formatDateHeader(selectedDate)}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {selectedDate && (
                        <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-1" />
                            {dateExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </div>
                    )}
                </CardHeader>

                {dateExpanded && (
                    <CardContent className="pt-4">
                        {isLoadingDates && isClassBooking ? (
                            <div className="flex justify-center items-center h-[300px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
                            </div>
                        ) : (
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => !isDateAvailable(date)}
                                className="rounded-md border"
                                locale={nl}
                            />
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Time Selection Section */}
            <Card className="mb-4">
                <CardHeader
                    className={`pb-2 flex flex-row items-center justify-between cursor-pointer ${selectedTime ? 'border-b' : ''}`}
                    onClick={toggleTimeSection}
                >
                    <div className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        <div>
                            <CardTitle className="text-base">
                                {selectedTime ? 'Geselecteerde Tijd' : 'Kies een Tijd'}
                            </CardTitle>
                            {selectedTime && !timeExpanded && (
                                <CardDescription className="mt-1">
                                    {selectedTime}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {selectedTime && (
                        <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-1" />
                            {timeExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </div>
                    )}
                </CardHeader>

                {timeExpanded && (
                    <CardContent className="pt-4">
                        {isLoadingTimeSlots ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : availableTimes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {availableTimes.map((slot) => (
                                    <Button
                                        key={slot.startTime}
                                        variant={selectedTime === slot.startTime ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => handleTimeSelect(slot.startTime)}
                                        style={{
                                            backgroundColor: selectedTime === slot.startTime ? primaryColor : undefined,
                                        }}
                                    >
                                        {slot.startTime}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">
                                Geen beschikbare tijdsloten voor deze datum
                            </p>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Submit Button */}
            <Button
                className="w-full"
                disabled={!selectedDate || !selectedTime || isLoading}
                onClick={handleSubmit}
                style={{ backgroundColor: primaryColor }}
            >
                {isLoading ? 'Bezig met boeken...' : 'Doorgaan naar bevestiging'}
            </Button>
        </div>
    );
} 