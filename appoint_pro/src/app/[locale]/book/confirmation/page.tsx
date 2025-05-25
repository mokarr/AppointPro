import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import { getFacilityById } from '@/services/facility';
import { getClassById } from '@/services/class';
import BookingForm from '@/app/[locale]/book/confirmation/BookingForm';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Facility, Location, Class } from "@prisma/client";
import OrganizationWithSettings from '@/models/Settings/OganizationWithSettings';
import { BookingIndicator } from '@/components/booking/BookingIndicatior';

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
    const classId = typeof resolvedSearchParams.classId === 'string' ? resolvedSearchParams.classId : '';
    const classSessionId = typeof resolvedSearchParams.classSessionId === 'string' ? resolvedSearchParams.classSessionId : '';
    const dateTime = typeof resolvedSearchParams.dateTime === 'string' ? resolvedSearchParams.dateTime : '';
    const endDateTime = typeof resolvedSearchParams.endDateTime === 'string' ? resolvedSearchParams.endDateTime : '';
    const duration = typeof resolvedSearchParams.duration === 'string' ? parseInt(resolvedSearchParams.duration) : undefined;
    const personCount = typeof resolvedSearchParams.personCount === 'string' ? parseInt(resolvedSearchParams.personCount) : 1;

    // Determine booking type and validate required parameters
    const isClassBooking = !!classId;
    const isFacilityBooking = !!facilityId;

    if (!locationId || (!isClassBooking && !isFacilityBooking) || !dateTime) {
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

    // Get the selected facility or class
    let selectedItem: Facility | Class | null = null;
    let itemType = '';

    if (isClassBooking) {
        const classResponse = await getClassById(classId);
        selectedItem = classResponse as Class;
        itemType = 'Les';
    } else {
        const facilityResponse = await getFacilityById(facilityId);
        selectedItem = facilityResponse as Facility;
        itemType = 'Faciliteit';
    }

    if (!selectedItem) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">{itemType} niet gevonden</h1>
                <p className="mb-4">De geselecteerde {itemType.toLowerCase()} bestaat niet of is niet toegankelijk.</p>
                <a
                    href={isClassBooking ? `/book/classes?locationId=${locationId}` : `/book/facilities?locationId=${locationId}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Terug naar {isClassBooking ? 'les' : 'faciliteit'} keuze
                </a>
            </div>
        );
    }

    // Simuleer een boekingsnummer
    const bookingNumber = Math.floor(10000000 + Math.random() * 90000000);

    // Define brand colors with fallbacks
    const primaryColor = organization.OrganizationSettings?.data.branding.primaryColor || '#2563eb';
    const secondaryColor = organization.OrganizationSettings?.data.branding.secondaryColor || '#1d4ed8';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
                        Boek bij {organization.name}
                    </h1>
                    {organization.OrganizationSettings?.data.branding.logo && (
                        <div className="h-12">
                            <img
                                src={'url' in organization.OrganizationSettings.data.branding.logo 
                                    ? organization.OrganizationSettings.data.branding.logo.url 
                                    : organization.OrganizationSettings.data.branding.logo.base64Data}
                                alt={`${organization.name} logo`}
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    )}
                </div>

                <BookingIndicator 
                    primaryColor={primaryColor}
                    currentStep={5}
                    isClassBooking={isClassBooking}
                />

                {/* Confirmation Box */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-orange-500 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor }}>Locatie</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800">{selectedLocation.name}</p>
                                    <p className="text-gray-600">{selectedLocation.address}</p>
                                    {selectedLocation.postalCode && (
                                        <p className="text-gray-500">{selectedLocation.postalCode}, {selectedLocation.country || ''}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor }}>{itemType}</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800">{selectedItem.name}</p>
                                    <p className="text-gray-600">{selectedItem.description}</p>
                                    {'price' in selectedItem && selectedItem.price && (
                                        <p className="font-semibold mt-2" style={{ color: primaryColor }}>Prijs: €{selectedItem.price.toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add datetime info */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3" style={{ color: primaryColor }}>Datum en tijd</h3>
                            <div className="bg-gray-50 p-4 rounded-lg flex">
                                <div className="mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: primaryColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{formattedDate}</p>
                                    <p className="text-gray-600">{formattedTime} - {formattedEndTime} uur</p>
                                    {duration && (
                                        <p className="text-gray-600 text-sm">Duur: {duration} minuten</p>
                                    )}
                                    <p className="text-gray-600 text-sm">Aantal personen: {personCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Use BookingForm component with the updated parameters */}
                        <BookingForm
                            facilityId={facilityId}
                            classId={classId}
                            classSessionId={classSessionId}
                            locationId={locationId}
                            bookingNumber={bookingNumber}
                            dateTime={dateTime}
                            endDateTime={endDateTime}
                            duration={duration}
                            isClassBooking={isClassBooking}
                            personCount={personCount}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 