import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import { getClassesByLocationId } from '@/services/class';
import { Class, Location } from '@prisma/client';
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

// Cached function to get classes for a location
const getLocationClasses = cache(async (locationId: string) => {
    if (!locationId) {
        return [];
    }

    try {
        const classes = await getClassesByLocationId(locationId);
        return classes || [];
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
});

// Find a location by ID in an organization
const findLocationById = (organization: OrganizationWithSettings, locationId: string): Location | null => {
    if (!organization || !organization.locations) return null;
    return organization.locations.find((loc: Location) => loc.id === locationId) || null;
};

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Get locationId from query params
    const resolvedSearchParams = await searchParams;
    const locationId = typeof resolvedSearchParams.locationId === 'string' ? resolvedSearchParams.locationId : '';

    if (!locationId) {
        redirect('/book/type/class');
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

    // Define brand colors with fallbacks
    const primaryColor = organization.OrganizationSettings?.data.branding.primaryColor || '#2563eb';
    const secondaryColor = organization.OrganizationSettings?.data.branding.secondaryColor || '#1d4ed8';

    // Find the selected location
    const selectedLocation = findLocationById(organization, locationId);

    if (!selectedLocation) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Locatie niet gevonden</h1>
                <p className="mb-4">De geselecteerde locatie bestaat niet of is niet toegankelijk.</p>
                <a
                    href="/book/type/class"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Terug naar locatie keuze
                </a>
            </div>
        );
    }

    // Get classes for the selected location
    const classes = await getLocationClasses(locationId);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
                        Boek een les bij {organization.name}
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
                    currentStep={3}
                    isClassBooking={true}
                />

                {/* Selected Location Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium text-blue-800">Gekozen locatie:</h2>
                            <p className="text-blue-700">{selectedLocation.name} - {selectedLocation.address}</p>
                        </div>
                        <a
                            href="/book/type/class"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Wijzigen
                        </a>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-6">Kies een les</h2>

                {classes && classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.map((classItem: Class) => (
                            <div
                                key={classItem.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>{classItem.name}</h3>
                                    <p className="text-gray-600 mb-4">{classItem.description}</p>

                                    {/* {classItem.price && (
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600">Prijs:</span>
                                            <span className="font-semibold">€{classItem.price.toFixed(2)}</span>
                                        </div>
                                    )} */}

                                    <a
                                        href={`/book/datetime?locationId=${locationId}&classId=${classItem.id}`}
                                        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Kies deze les
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="text-yellow-700">
                            Er zijn geen lessen beschikbaar voor deze locatie.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 