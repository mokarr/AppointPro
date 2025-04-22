'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrganizationBySubdomain } from '@/services/organization';
import { useRouter } from 'next/navigation';

// Define types for organization data
interface Location {
    id: string;
    name: string;
    address: string;
    postalCode?: string | null;
    country?: string | null;
    organizationId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface Organization {
    id: string;
    name: string;
    branche: string;
    description: string;
    subdomain: string;
    locations: Location[];
    hasActiveSubscription?: boolean;
}

// Type for the service response
interface ActionResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export default function OrganizationPage() {
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                setLoading(true);
                const result = await getOrganizationBySubdomain(subdomain);
                // Check if the response has the expected format and extract the data
                if (result && typeof result === 'object' && 'data' in result) {
                    setOrganization(result.data as Organization);
                } else {
                    // Fallback in case the service directly returns the organization
                    setOrganization(result as unknown as Organization);
                }
                setError(null);
            } catch (err) {
                setError('Organization not found');
                // Redirect to not-found page after a short delay
                setTimeout(() => {
                    router.push('/organization-not-found');
                }, 1000);
            } finally {
                setLoading(false);
            }
        };

        if (subdomain) {
            fetchOrganization();
        }
    }, [subdomain, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-4 text-center text-gray-700">Loading organization information...</p>
                </div>
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Organization Not Found</h1>
                    <p className="text-gray-700">We could not find the organization you're looking for.</p>
                    <p className="text-gray-700 mt-2">Redirecting to not found page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="bg-blue-600 py-6 px-8">
                        <h1 className="text-3xl font-bold text-white">{organization.name}</h1>
                        <p className="text-blue-100 mt-2">{organization.branche}</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Us</h2>
                            <p className="text-gray-600">{organization.description}</p>
                        </div>

                        {organization.locations && organization.locations.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Locations</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {organization.locations.map((location) => (
                                        <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-800">{location.name}</h3>
                                            <p className="text-gray-600 mt-1">{location.address}</p>
                                            {location.postalCode && (
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {location.postalCode}, {location.country || ''}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <a
                                href="/book"
                                className="block w-full md:w-auto md:inline-block text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                tabIndex={0}
                                aria-label="Book an appointment with this organization"
                            >
                                Book an Appointment
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 