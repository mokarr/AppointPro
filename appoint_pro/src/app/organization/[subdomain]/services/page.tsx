'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrganizationBySubdomain } from '@/services/organization';

// For this example, I'm creating a simple mock service interface
interface Service {
    id: string;
    name: string;
    description: string;
    duration: number; // In minutes
    price: number;
}

// Type for organization data
interface Organization {
    id: string;
    name: string;
    branche: string;
    description: string;
    subdomain: string;
    locations: any[];
    hasActiveSubscription?: boolean;
}

// Type for the service response
interface ActionResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// Mock services - in a real implementation, these would come from the API
const mockServices: Record<string, Service[]> = {
    // Default services for any organization
    default: [
        {
            id: 'service-1',
            name: 'Basic Consultation',
            description: 'Initial consultation to understand your needs and goals.',
            duration: 30,
            price: 50,
        },
        {
            id: 'service-2',
            name: 'Standard Session',
            description: 'A standard training or activity session.',
            duration: 60,
            price: 75,
        },
        {
            id: 'service-3',
            name: 'Premium Session',
            description: 'An extended session with personalized attention and additional services.',
            duration: 90,
            price: 120,
        },
    ],
};

export default function OrganizationServicesPage() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [organizationName, setOrganizationName] = useState<string>('');
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            try {
                setLoading(true);

                // Fetch organization data
                const result = await getOrganizationBySubdomain(subdomain);

                // Extract organization data from response
                let organizationData: Organization;
                if (result && typeof result === 'object') {
                    if ('data' in result) {
                        // If it's in the format of ActionResponse
                        organizationData = (result as ActionResponse<Organization>).data;
                    } else {
                        // If it's directly the organization object
                        organizationData = result as Organization;
                    }

                    // Set organization name for display
                    if (organizationData && organizationData.name) {
                        setOrganizationName(organizationData.name);
                    } else {
                        setOrganizationName('Our Organization');
                    }
                } else {
                    setOrganizationName('Our Organization');
                }

                // In a real application, you would fetch the services for this organization
                // For now, we'll use the mock services
                setServices(mockServices.default);

                setError(null);
            } catch (err) {
                setError('Failed to load organization services');
            } finally {
                setLoading(false);
            }
        };

        if (subdomain) {
            fetchOrganizationData();
        }
    }, [subdomain]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="mt-4 text-center text-gray-700">Loading services...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h1>
                    <p className="text-lg text-gray-600">
                        {organizationName} offers the following services. Book an appointment today!
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h2>
                                <p className="text-gray-600 mb-4">{service.description}</p>

                                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{service.duration} minutes</span>
                                    </div>
                                    <div className="font-medium text-gray-900">${service.price}</div>
                                </div>

                                <a
                                    href="/book"
                                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    tabIndex={0}
                                    aria-label={`Book ${service.name}`}
                                >
                                    Book Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 