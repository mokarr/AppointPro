import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getOrganizationById } from '@/services/organization';
import OrganizationWithSettings from "@/models/Settings/OganizationWithSettings";
import DateTimeContent from './DateTimeContent';

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

export default async function DateTimePage() {
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
    const primaryColor = organization.Settings?.data.branding.primaryColor || '#2563eb';
    const secondaryColor = organization.Settings?.data.branding.secondaryColor || '#1d4ed8';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
                        Boek bij {organization.name}
                    </h1>
                    {organization.Settings?.data.branding.logo && (
                        <div className="h-12">
                            <img
                                src={'url' in organization.Settings.data.branding.logo 
                                    ? organization.Settings.data.branding.logo.url 
                                    : organization.Settings.data.branding.logo.base64Data}
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
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                            <span className="mt-2 text-green-600 font-medium">Locatie</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                            <span className="mt-2 text-green-600 font-medium">Faciliteit</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                3
                            </div>
                            <span className="mt-2 font-medium" style={{ color: primaryColor }}>Tijdslot</span>
                        </div>
                        <div className="h-1 flex-1 bg-gray-300 mx-4"></div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">4</div>
                            <span className="mt-2 text-gray-600">Bevestiging</span>
                        </div>
                    </div>
                </div>

                <DateTimeContent 
                    organization={organization}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                />
            </div>
        </div>
    );
} 