'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
    facilityId: string;
    locationId: string;
    bookingNumber: number;
}

export default function BookingForm({ facilityId, locationId, bookingNumber }: BookingFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
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
            // Create date object from date and time inputs
            const bookingDate = new Date(`${formData.date}T${formData.time}`);
            // End time is 1 hour after start time (you can adjust this as needed)
            const endTime = new Date(bookingDate.getTime() + 60 * 60 * 1000);

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facilityId,
                    locationId,
                    startTime: bookingDate.toISOString(),
                    endTime: endTime.toISOString(),
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    notes: formData.notes,
                    // No userId provided for guest bookings
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Er is iets misgegaan bij het maken van de boeking');
            }

            // Show success state
            setSuccess(true);

            // Redirect after a short delay (optional)
            setTimeout(() => {
                router.push(`/book/confirmation/success?bookingId=${data.data.id}`);
            }, 2000);

        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err instanceof Error ? err.message : 'Er is iets misgegaan bij het maken van de boeking');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Boeking Succesvol!</h3>
                <p className="text-green-700 mb-4">Uw boeking is bevestigd. Bedankt voor het boeken!</p>
                <p className="text-green-700 mb-4">U wordt nu doorgestuurd...</p>
            </div>
        );
    }

    return (
        <form className="mb-8" onSubmit={handleSubmit}>
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            <h3 className="text-lg font-semibold mb-4">Uw gegevens</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="firstName">Voornaam</label>
                    <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="lastName">Achternaam</label>
                    <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="email">E-mail</label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 mb-1" htmlFor="phone">Telefoonnummer</label>
                <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            <h3 className="text-lg font-semibold mb-4">Gewenste datum en tijd</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="date">Datum</label>
                    <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1" htmlFor="time">Tijd</label>
                    <input
                        type="time"
                        id="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>

            <div className="mb-8">
                <label className="block text-gray-700 mb-1" htmlFor="notes">Opmerkingen (optioneel)</label>
                <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                ></textarea>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center">
                <a
                    href={`/book/facilities?locationId=${locationId}`}
                    className="text-blue-600 hover:text-blue-800 mb-4 md:mb-0"
                >
                    ← Terug naar faciliteiten
                </a>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-block ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-3 px-8 rounded-md transition-colors`}
                >
                    {isSubmitting ? 'Bezig met verwerken...' : 'Bevestig Boeking'}
                </button>
            </div>
        </form>
    );
} 