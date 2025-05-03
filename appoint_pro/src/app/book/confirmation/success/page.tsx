import { getBookingById } from '@/services/booking';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { differenceInMinutes } from 'date-fns';

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Resolve the searchParams Promise
    const resolvedSearchParams = await searchParams;
    const bookingId = typeof resolvedSearchParams.bookingId === 'string' ? resolvedSearchParams.bookingId : '';

    if (!bookingId) {
        redirect('/book');
    }

    // Fetch the booking details
    let booking;
    try {
        booking = await getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }
    } catch (error) {
        console.error('Error fetching booking:', error);
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Boeking niet gevonden</h1>
                <p className="mb-4">De boeking kon niet worden gevonden of is niet toegankelijk.</p>
                <a
                    href="/book"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Terug naar boekingspagina
                </a>
            </div>
        );
    }

    // Format the booking details for display
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    // Calculate duration in minutes
    const durationMinutes = differenceInMinutes(endTime, startTime);

    // Format duration for display
    let durationText = '';
    if (durationMinutes === 60) {
        durationText = '1 uur';
    } else if (durationMinutes > 60 && durationMinutes % 60 === 0) {
        durationText = `${durationMinutes / 60} uur`;
    } else if (durationMinutes < 60) {
        durationText = `${durationMinutes} minuten`;
    } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        durationText = `${hours} uur ${minutes > 0 ? `en ${minutes} minuten` : ''}`;
    }

    const formattedDate = startTime.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedStartTime = startTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedEndTime = endTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-green-600 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Boeking Succesvol!</h1>
                    <p className="text-white text-opacity-90 text-lg">Uw boeking is bevestigd en staat ingepland.</p>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Boekingsdetails</h2>
                            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                                {booking.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-500">Boekingsnummer</p>
                                <p className="text-lg font-medium">{booking.id}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Datum</p>
                                <p className="text-lg font-medium">{formattedDate}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Tijdslot</p>
                                <p className="text-lg font-medium">{formattedStartTime} - {formattedEndTime}</p>
                                <p className="text-gray-600 text-sm">Duur: {durationText}</p>
                            </div>

                            {booking.customerName && (
                                <div>
                                    <p className="text-gray-500">Naam</p>
                                    <p className="text-lg font-medium">{booking.customerName}</p>
                                </div>
                            )}

                            {booking.customerEmail && (
                                <div>
                                    <p className="text-gray-500">E-mail</p>
                                    <p className="text-lg font-medium">{booking.customerEmail}</p>
                                </div>
                            )}

                            {booking.customerPhone && (
                                <div>
                                    <p className="text-gray-500">Telefoonnummer</p>
                                    <p className="text-lg font-medium">{booking.customerPhone}</p>
                                </div>
                            )}

                            {booking.notes && (
                                <div>
                                    <p className="text-gray-500">Opmerkingen</p>
                                    <p className="text-gray-700">{booking.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 text-center">
                        <p className="text-gray-600 mb-6">
                            We hebben een bevestiging naar uw e-mail gestuurd. Als u vragen heeft, neem dan contact met ons op.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                                aria-label="Terug naar Home"
                            >
                                Terug naar Home
                            </Link>
                            <a
                                href="/book"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors"
                            >
                                Nieuwe Boeking
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 