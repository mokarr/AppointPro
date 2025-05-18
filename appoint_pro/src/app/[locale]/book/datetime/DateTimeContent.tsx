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

// Interface matching the API response
interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface DateTimeContentProps {
    organization: OrganizationWithSettings;
    primaryColor: string;
    secondaryColor: string;
}

export default function DateTimeContent({ organization, primaryColor, secondaryColor }: DateTimeContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const locationId = searchParams.get('locationId');
    const facilityId = searchParams.get('facilityId');

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default: 1 hour (60 minutes)
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

    // UI state for accordion sections
    const [dateExpanded, setDateExpanded] = useState(true);
    const [timeExpanded, setTimeExpanded] = useState(false);

    // Redirect if missing required parameters
    useEffect(() => {
        if (!locationId || !facilityId) {
            router.push('/book');
        }
    }, [locationId, facilityId, router]);

    // Fetch available time slots when date or duration changes
    useEffect(() => {
        if (!selectedDate || !facilityId) {
            setAvailableTimeSlots([]);
            return;
        }

        const fetchAvailableTimeSlots = async () => {
            setIsLoadingTimeSlots(true);
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                const url = `/api/timeslots?facilityId=${facilityId}&date=${formattedDate}&duration=${selectedDuration}`;

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
    }, [selectedDate, selectedDuration, facilityId]);

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime || !facilityId || !locationId) return;

        setIsLoading(true);

        // Find the selected time slot to get the end time
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
        const confirmationUrl = `/book/confirmation?locationId=${locationId}&facilityId=${facilityId}&dateTime=${startDateTime}&endDateTime=${endDateTime}&duration=${selectedDuration}`;

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
                    Terug naar faciliteiten
                </Button>
            </div>

            {/* Duration Section - Always Visible */}
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
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            locale={nl}
                            disabled={(date) =>
                                isBefore(date, new Date()) ||
                                isAfter(date, addDays(new Date(), 30))
                            }
                            className="rounded-md border mx-auto"
                        />
                    </CardContent>
                )}
            </Card>

            {/* Time Selection Section */}
            <Card className={`mb-4 ${!selectedDate ? 'opacity-60 pointer-events-none' : ''}`}>
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
                                    {selectedTime} - {availableTimeSlots.find(slot => slot.startTime === selectedTime)?.endTime}
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
                        {selectedDate && (
                            <div className="mb-4">
                                <p className="font-medium text-gray-700 mb-2">
                                    Selecteer een tijdslot voor {formatDateHeader(selectedDate)}
                                </p>

                                {isLoadingTimeSlots ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {[...Array(6)].map((_, index) => (
                                            <Skeleton key={index} className="h-14 w-full" />
                                        ))}
                                    </div>
                                ) : availableTimes.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {availableTimes.map((slot) => (
                                            <Button
                                                key={slot.startTime}
                                                variant={selectedTime === slot.startTime ? "default" : "outline"}
                                                className={`${selectedTime === slot.startTime ? `bg-[${primaryColor}]` : ""} text-sm flex-col h-auto py-2`}
                                                onClick={() => handleTimeSelect(slot.startTime)}
                                            >
                                                <span>{slot.startTime}</span>
                                                <span className="text-xs opacity-70">- {slot.endTime}</span>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500">Geen tijdsloten beschikbaar op deze datum.</p>
                                        <p className="text-gray-500 text-sm mt-2">Selecteer een andere datum.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            <Button
                variant="default"
                className="w-full py-6 text-lg text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={!selectedDate || !selectedTime || isLoading}
                onClick={handleSubmit}
            >
                {isLoading ? "Bezig..." : "Bevestig Tijdslot"}
            </Button>
        </div>
    );
} 