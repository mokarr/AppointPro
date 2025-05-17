import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import { getFacilityById } from '@/services/facility';
import BookingForm from '@/app/[locale]/book/confirmation/BookingForm';
import type { OrganizationWithLocations, Location } from '@/types/organization';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Facility } from "@prisma/client";
import { OrganizationSettings } from '@/types/settings';

interface OrganizationWithSettings {
    id: string;
    name: string;
    subdomain: string | null;
    branche: string;
    description: string;
    locations: any[];
    phone: string | null;
    email: string | null;
    updatedAt: Date;
    createdAt: Date;
    stripeCustomerId: string | null;
    hasActiveSubscription: boolean;
    Settings: {
        data: OrganizationSettings;
    } | null;
}


// Cached function to get organization data
const getOrganizationData = cache(async (organizationId: string) => {
    if (!organizationId) {
        return null;
    }

    try {
        const organization = await getOrganizationById(organizationId);
        return organization as OrganizationWithSettings;
    } catch (error) {
        console.error('Error fetching organization:', error);
        return null;
    }
});

// Find a location by ID in an organization
const findLocationById = (organization: OrganizationWithSettings, locationId: string): Location | null => {
    if (!organization || !organization.locations) return null;
    return organization.locations.find((loc: Location) => loc.id === locationId) || null;
};

// First, update the component props and add datetime handling
type Props = {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfirmationPage({ params, searchParams }: Props) {
    // Get query parameters from the Promise
    const resolvedSearchParams = await searchParams;
    const locationId = typeof resolvedSearchParams.locationId === 'string' ? resolvedSearchParams.locationId : '';
    const facilityId = typeof resolvedSearchParams.facilityId === 'string' ? resolvedSearchParams.facilityId : '';
    const dateTime = typeof resolvedSearchParams.dateTime === 'string' ? resolvedSearchParams.dateTime : '';
    const endDateTime = typeof resolvedSearchParams.endDateTime === 'string' ? resolvedSearchParams.endDateTime : '';
    const duration = typeof resolvedSearchParams.duration === 'string' ? parseInt(resolvedSearchParams.duration) : undefined;

    if (!locationId || !facilityId || !dateTime) {
        redirect('/book');
    }

    // Format the datetime for display
    const appointmentDate = new Date(dateTime);
    const formattedDate = format(appointmentDate, 'EEEE d MMMM yyyy', { locale: nl });
    const formattedTime = format(appointmentDate, 'HH:mm');

    // Format end time for display if available
    let formattedEndTime = '';
    if (endDateTime) {
        const endDate = new Date(endDateTime);
        formattedEndTime = format(endDate, 'HH:mm');
    }

    // Read the organization ID from the custom header set by middleware
    const headersList = await headers();
    const organizationId = headersList.get('x-organizationSubdomainId');

    // If no organization ID in the header, redirect to the landing page
    if (!organizationId) {
        redirect('/landing/user');
    }

    // Get organization data
    const organization = await getOrganizationData(organizationId);

    if (!organization) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Organisatie niet gevonden</h1>
                <p className="mb-4">De organisatie waarvoor u wilt boeken bestaat niet of is niet toegankelijk.</p>
                <a
                    href="/landing/user"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Naar Home
                </a>
            </div>
        );
    }

    // Find the selected location
    const selectedLocation = findLocationById(organization, locationId);

    if (!selectedLocation) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Locatie niet gevonden</h1>
                <p className="mb-4">De geselecteerde locatie bestaat niet of is niet toegankelijk.</p>
                <a
                    href="/book"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Terug naar locatie keuze
                </a>
            </div>
        );
    }

    // Get the selected facility
    const facilityResponse = await getFacilityById(facilityId);
    const selectedFacility = facilityResponse as Facility;

    if (!selectedFacility) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Faciliteit niet gevonden</h1>
                <p className="mb-4">De geselecteerde faciliteit bestaat niet of is niet toegankelijk.</p>
                <a
                    href={`/book/facilities?locationId=${locationId}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Terug naar faciliteit keuze
                </a>
            </div>
        );
    }

    // Simuleer een boekingsnummer
    const bookingNumber = Math.floor(10000000 + Math.random() * 90000000);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Boek bij {organization.name}</h1>

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
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                            <span className="mt-2 text-green-600 font-medium">Tijdslot</span>
                        </div>
                        <div className="h-1 flex-1 bg-green-500 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                            <span className="mt-2 text-blue-600 font-medium">Bevestiging</span>
                        </div>
                    </div>
                </div>

                {/* Confirmation Box */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-600 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Boeking bijna bevestigd!</h2>
                        <p className="text-white text-opacity-90">Controleer uw boeking en bevestig</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-6">
                            <p className="text-gray-600 mb-1">Boekingsnummer</p>
                            <p className="text-lg font-semibold">{bookingNumber}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Locatie</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800">{selectedLocation.name}</p>
                                    <p className="text-gray-600">{selectedLocation.address}</p>
                                    {selectedLocation.postalCode && (
                                        <p className="text-gray-500">{selectedLocation.postalCode}, {selectedLocation.country || ''}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Faciliteit</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800">{selectedFacility.name}</p>
                                    <p className="text-gray-600">{selectedFacility.description}</p>
                                    {selectedFacility.price && (
                                        <p className="text-blue-600 font-semibold mt-2">Prijs: €{selectedFacility.price.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add datetime info */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">Datum en tijd</h3>
                            <div className="bg-gray-50 p-4 rounded-lg flex">
                                <div className="mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{formattedDate}</p>
                                    <p className="text-gray-600">{formattedTime} - {formattedEndTime} uur</p>
                                    {duration && (
                                        <p className="text-gray-600 text-sm">Duur: {duration} minuten</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Use BookingForm component with the updated parameters */}
                        <BookingForm
                            facilityId={facilityId}
                            locationId={locationId}
                            bookingNumber={bookingNumber}
                            dateTime={dateTime}
                            endDateTime={endDateTime}
                            duration={duration}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 