'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Location {
    id: string;
    name: string;
    address?: string;
    postalCode?: string | null;
    country?: string | null;
}

interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
}

interface Employee {
    id: string;
    name: string;
    email: string;
}

interface Organization {
    id: string;
    name: string;
    locations: Location[];
    services: Service[];
    Employee: Employee[];
}

interface BookingFormProps {
    organization: Organization;
    initialLocationId?: string;
}

export default function BookingForm({ organization, initialLocationId }: BookingFormProps) {
    const { t } = useLanguage();
    const [selectedLocation, setSelectedLocation] = useState<string>(initialLocationId || '');
    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>();

    const getString = (key: string): string => {
        const value = t(key);
        return typeof value === 'string' ? value : '';
    };

    const handleSubmit = async () => {
        // TODO: Implement booking submission
        console.log({
            locationId: selectedLocation,
            serviceId: selectedService,
            employeeId: selectedEmployee,
            date: selectedDate,
        });
    };

    return (
        <Card className="p-6">
            <form className="space-y-6">
                {/* Location Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {getString('booking.selectLocation')}
                    </label>
                    <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={getString('booking.selectLocationPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {organization.locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {getString('booking.selectService')}
                    </label>
                    <Select
                        value={selectedService}
                        onValueChange={setSelectedService}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={getString('booking.selectServicePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {organization.services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                    {service.name} - €{service.price} ({service.duration} min)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Employee Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {getString('booking.selectEmployee')}
                    </label>
                    <Select
                        value={selectedEmployee}
                        onValueChange={setSelectedEmployee}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={getString('booking.selectEmployeePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {organization.Employee.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {getString('booking.selectDate')}
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                    format(selectedDate, "PPP")
                                ) : (
                                    <span>{getString('booking.selectDatePlaceholder')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Submit Button */}
                <Button
                    type="button"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={!selectedLocation || !selectedService || !selectedEmployee || !selectedDate}
                >
                    {getString('booking.submit')}
                </Button>
            </form>
        </Card>
    );
} 