import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import OrganizationWithSettings from "@/models/Settings/OganizationWithSettings";
import Image from "next/image";
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
                    currentStep={1}
                />

                <h2 className="text-xl font-semibold mb-6" style={{ color: primaryColor }}>Kies een type boeking</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>Faciliteit Boeking</h3>
                            <p className="text-gray-600 mb-4">Boek een faciliteit zoals een tennisbaan, zwembad of vergaderruimte.</p>
                            <a
                                href={`/book/location?type=facility`}
                                className="inline-block w-full text-center text-white font-medium py-3 px-6 rounded-md transition-colors hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Faciliteit Boeken
                            </a>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>Les Boeking</h3>
                            <p className="text-gray-600 mb-4">Boek een les of activiteit zoals yoga, fitness of een workshop.</p>
                            <a
                                href={'/book/location?type=class'}
                                className="inline-block w-full text-center text-white font-medium py-3 px-6 rounded-md transition-colors hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Les Boeken
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 