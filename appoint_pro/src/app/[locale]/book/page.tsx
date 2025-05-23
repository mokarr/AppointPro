import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import OrganizationWithSettings from "@/models/Settings/OganizationWithSettings";
import Image from "next/image";

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

export default async function BookingPage() {
    // Read the organization ID from the custom header set by middleware
    const headersList = await headers();
    const organizationId = headersList.get('x-organizationSubdomainId');

    // If no organization ID in the header, redirect to the landing page
    if (!organizationId) {
        redirect('/landing/user');
    }

    // Get organization data with locations
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

    // If there's only one location, redirect directly to facility selection for that location
    if (organization.locations && organization.locations.length === 1) {
        redirect(`/book/facilities?locationId=${organization.locations[0].id}`);
    }

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

                {/* Booking Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                1
                            </div>
                            <span className="mt-2 font-medium" style={{ color: primaryColor }}>Locatie</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">2</div>
                            <span className="mt-2 text-gray-600">Faciliteit</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">3</div>
                            <span className="mt-2 text-gray-600">Tijdslot</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">4</div>
                            <span className="mt-2 text-gray-600">Bevestiging</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-6" style={{ color: primaryColor }}>Kies een locatie</h2>

                {organization.locations && organization.locations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {organization.locations.map((location) => (
                            <div
                                key={location.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>{location.name}</h3>
                                    <p className="text-gray-600 mb-4">{location.address}</p>
                                    {location.postalCode && (
                                        <p className="text-gray-500 text-sm mb-4">{location.postalCode}, {location.country || ''}</p>
                                    )}
                                    <a
                                        href={`/book/facilities?locationId=${location.id}`}
                                        className="inline-block w-full text-center text-white font-medium py-3 px-6 rounded-md transition-colors hover:opacity-90"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Kies deze locatie
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="text-yellow-700">
                            Er zijn geen locaties beschikbaar voor deze organisatie.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 