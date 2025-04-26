import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import { getFacilitiesByLocationId, Facility } from '@/services/facility';
import type { OrganizationWithLocations, Location } from '@/types/organization';

// Cached function to get organization data
const getOrganizationData = cache(async (organizationId: string) => {
    if (!organizationId) {
        return null;
    }

    try {
        const organization = await getOrganizationById(organizationId);
        return organization as OrganizationWithLocations;
    } catch (error) {
        console.error('Error fetching organization:', error);
        return null;
    }
});

// Cached function to get facilities for a location
const getLocationFacilities = cache(async (locationId: string) => {
    if (!locationId) {
        return [];
    }

    try {
        const facilities = await getFacilitiesByLocationId(locationId);
        return facilities || [];
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return [];
    }
});

// Find a location by ID in an organization
const findLocationById = (organization: OrganizationWithLocations, locationId: string): Location | null => {
    if (!organization || !organization.locations) return null;
    return organization.locations.find((loc: Location) => loc.id === locationId) || null;
};

export default async function FacilitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Get locationId from query params
    const resolvedSearchParams = await searchParams;
    const locationId = typeof resolvedSearchParams.locationId === 'string' ? resolvedSearchParams.locationId : '';

    if (!locationId) {
        redirect('/book');
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

    // Get facilities for the selected location
    const facilities = await getLocationFacilities(locationId);

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
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            <span className="mt-2 text-blue-600 font-medium">Faciliteit</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">3</div>
                            <span className="mt-2 text-gray-600">Bevestiging</span>
                        </div>
                    </div>
                </div>

                {/* Selected Location Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-medium text-blue-800">Gekozen locatie:</h2>
                            <p className="text-blue-700">{selectedLocation.name} - {selectedLocation.address}</p>
                        </div>
                        <a
                            href="/book"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Wijzigen
                        </a>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-6">Kies een faciliteit</h2>

                {facilities && facilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {facilities.map((facility: Facility) => (
                            <div
                                key={facility.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{facility.name}</h3>
                                    <p className="text-gray-600 mb-4">{facility.description}</p>

                                    {facility.price && (
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600">Prijs:</span>
                                            <span className="font-semibold">€{facility.price.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <a
                                        href={`/book/confirmation?locationId=${locationId}&facilityId=${facility.id}`}
                                        className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                                    >
                                        Kies deze faciliteit
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="text-yellow-700">
                            Er zijn geen faciliteiten beschikbaar voor deze locatie.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 