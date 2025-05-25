'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, addHours, addMinutes } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface BookingFormProps {
    facilityId?: string;
    classId?: string;
    classSessionId?: string;
    locationId: string;
    bookingNumber: number;
    dateTime: string;
    endDateTime?: string;
    duration?: number;
    isClassBooking: boolean;
    personCount: number;
}

export default function BookingForm({ 
    facilityId, 
    classId,
    classSessionId,
    locationId, 
    bookingNumber, 
    dateTime, 
    endDateTime, 
    duration, 
    isClassBooking,
    personCount
}: BookingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const parsedDateTime = parseISO(dateTime);

    // Calculate end time based on provided endDateTime or duration or default to 1 hour
    let endTime;
    if (endDateTime) {
        endTime = parseISO(endDateTime);
    } else if (duration) {
        endTime = addMinutes(parsedDateTime, duration);
    } else {
        endTime = addHours(parsedDateTime, 1); // Fallback to 1 hour
    }

    const formattedDate = format(parsedDateTime, 'yyyy-MM-dd');
    const formattedTime = format(parsedDateTime, 'HH:mm');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: formattedDate,
        time: formattedTime,
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startTime: dateTime,
                    endTime: endDateTime,
                    facilityId: facilityId,
                    classSessionId: classSessionId,
                    locationId: locationId,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    notes: formData.notes,
                    isClassBooking: isClassBooking,
                    personCount: personCount
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create booking');
            }

            //TODO: create model for response
            const data = await response.json();
            console.log(data.data.id);

            setSuccess(true);
            setTimeout(() => {
                router.push(`/book/confirmation/redirect?bookingId=${data.data.id}`);
            }, 2000);
        } catch (error) {
            console.error('Error creating booking:', error);
            setError(error instanceof Error ? error.message : 'Failed to create booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Voornaam</Label>
                    <Input
                        type="text"
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Achternaam</Label>
                    <Input
                        type="text"
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer</Label>
                <Input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Datum</Label>
                    <Input
                        type="text"
                        id="date"
                        required
                        readOnly
                        disabled
                        value={formData.date}
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Tijd</Label>
                    <Input
                        type="text"
                        id="time"
                        required
                        readOnly
                        disabled
                        value={formData.time}
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
                <Textarea
                    id="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <AlertDescription>Boeking succesvol aangemaakt! U wordt doorgestuurd...</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Bezig met boeken...' : 'Bevestig Boeking'}
                </Button>
            </div>
        </form>
    );
} 