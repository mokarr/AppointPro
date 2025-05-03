'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addDays, addMinutes, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
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

// Available duration options in minutes
const DURATION_OPTIONS = [
    { value: 30, label: '30 minuten' },
    { value: 60, label: '1 uur' },
    { value: 90, label: '1 uur 30 minuten' },
    { value: 120, label: '2 uur' },
    { value: 180, label: '3 uur' },
    { value: 240, label: '4 uur' },
];

export default function DateTimePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const locationId = searchParams.get('locationId');
    const facilityId = searchParams.get('facilityId');

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default: 1 hour (60 minutes)
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // UI state for accordion sections
    const [dateExpanded, setDateExpanded] = useState(true);
    const [timeExpanded, setTimeExpanded] = useState(false);

    // Redirect if missing required parameters
    useEffect(() => {
        if (!locationId || !facilityId) {
            router.push('/book');
        }
    }, [locationId, facilityId, router]);

    // Generate available time slots when date changes
    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimes([]);
            return;
        }

        // Generate time slots from 9:00 to 17:00
        const times: string[] = [];
        const now = new Date();
        const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        // Start times at 9:00 AM
        let startHour = 9;
        let startMinute = 0;

        // If today, only show future time slots
        if (isToday) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            if (currentHour >= 17) {
                // No slots available for today
                setAvailableTimes([]);
                return;
            }

            if (currentHour >= 9) {
                startHour = currentHour;
                startMinute = currentMinute < 30 ? 30 : 0;
                if (startMinute === 0) startHour += 1;
            }
        }

        // Calculate the last possible starting time based on selected duration
        // For example, if duration is 2 hours (120 min), last starting time should be 15:00
        const durationHours = selectedDuration / 60;
        const lastPossibleHour = 17 - durationHours;

        // Generate 30-minute slots until the last possible starting time
        for (let hour = startHour; hour < lastPossibleHour; hour++) {
            for (let minute = hour === startHour ? startMinute : 0; minute < 60; minute += 30) {
                times.push(format(setHours(setMinutes(new Date(), minute), hour), 'HH:mm'));
            }
        }

        // Add the final slot if it fits exactly
        if (Number.isInteger(lastPossibleHour) && lastPossibleHour >= startHour) {
            times.push(format(setHours(setMinutes(new Date(), 0), Math.floor(lastPossibleHour)), 'HH:mm'));
        }

        // Simulate some slots being unavailable (remove random slots)
        const availableSlots = times.filter(() => Math.random() > 0.3);

        setAvailableTimes(availableSlots);
        setSelectedTime(null); // Reset selection when date changes

        // Auto expand time section when date is selected
        setTimeExpanded(true);
        setDateExpanded(false);
    }, [selectedDate, selectedDuration]);

    // Calculate end time based on selected time and duration
    const calculateEndTime = (startTime: string, durationMinutes: number) => {
        if (!selectedDate || !startTime) return null;

        // Parse the start time
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDateTime = new Date(selectedDate);
        startDateTime.setHours(hours, minutes, 0, 0);

        // Calculate end time by adding duration
        const endDateTime = addMinutes(startDateTime, durationMinutes);
        return format(endDateTime, 'HH:mm');
    };

    const handleSubmit = () => {
        if (!selectedDate || !selectedTime) return;

        setIsLoading(true);

        // Format date and time for passing as parameters
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const startDateTime = `${formattedDate}T${selectedTime}`;

        // Calculate end time
        const endTime = calculateEndTime(selectedTime, selectedDuration);
        const endDateTime = `${formattedDate}T${endTime}`;

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Kies een datum en tijd</h1>

                {/* Booking Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                            <span className="mt-2 text-green-600 font-medium">Locatie</span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                            <span className="mt-2 text-green-600 font-medium">Faciliteit</span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                            <span className="mt-2 text-blue-600 font-medium">Tijdslot</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">4</div>
                            <span className="mt-2 text-gray-600">Bevestiging</span>
                        </div>
                    </div>
                </div>

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
                                        {selectedTime} - {calculateEndTime(selectedTime, selectedDuration)}
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

                                    {availableTimes.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableTimes.map((time) => {
                                                const endTime = calculateEndTime(time, selectedDuration);
                                                return (
                                                    <Button
                                                        key={time}
                                                        variant={selectedTime === time ? "default" : "outline"}
                                                        className={`${selectedTime === time ? "bg-blue-600" : ""} text-sm flex-col h-auto py-2`}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        <span>{time}</span>
                                                        <span className="text-xs opacity-70">- {endTime}</span>
                                                    </Button>
                                                );
                                            })}
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
                    className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                    disabled={!selectedDate || !selectedTime || isLoading}
                    onClick={handleSubmit}
                >
                    {isLoading ? "Bezig..." : "Bevestig Tijdslot"}
                </Button>
            </div>
        </div>
    );
} 