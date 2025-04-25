import { Metadata, ResolvingMetadata } from "next";
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOrganizationById } from '@/services/organization';
import { cache } from 'react';

interface Location {
    id: string;
    name: string;
    address: string;
    postalCode?: string | null;
    country?: string | null;
    organizationId: string;
}

interface OrganizationWithLocations {
    id: string;
    name: string;
    description: string;
    branche: string;
    subdomain: string | null;
    hasActiveSubscription: boolean;
    locations: Location[];
    [key: string]: any; // Allow additional properties for flexibility
}

// Cached function to get organization data - will only run once per request
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

type Props = {
    params: {};
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // Read the organization ID from the custom header set by middleware
    const headersList = await headers();
    const organizationId = headersList.get('x-organizationSubdomainId');

    // Default metadata if no organization ID is found
    if (!organizationId) {
        return {
            title: 'Welcome | AppointPro',
            description: 'Book facilities and services with AppointPro',
        };
    }

    // Get organization data - will be cached
    const organization = await getOrganizationData(organizationId);

    if (!organization) {
        return {
            title: 'Welcome | AppointPro',
            description: 'Book facilities and services with AppointPro',
        };
    }

    // Return metadata with organization name
    return {
        title: `Welcome | ${organization.name}`,
        description: organization.description || 'Book facilities and services with AppointPro',
    };
}

export default async function LandingPage() {
    // Read the organization ID from the custom header set by middleware
    const headersList = await headers();
    const organizationId = headersList.get('x-organizationSubdomainId');

    // If no organization ID in the header, redirect to the default user landing page
    if (!organizationId) {
        redirect('/landing/user');
    }

    // Get organization data - will use the cached version if already called in generateMetadata
    const organization = await getOrganizationData(organizationId);

    if (!organization) {
        // If organization not found, show an error message
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4 text-red-600">Organization Not Found</h1>
                    <p className="text-gray-600 mb-6">The organization you are looking for does not exist or is not accessible.</p>
                    <a
                        href="/landing/user"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Voeg nav toe voor subdomain paginas */}
            {/* Header 
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">{organization.name}</h1>
                    <nav>
                        <ul className="flex space-x-6">
                            <li><a href="/" className="text-gray-600 hover:text-blue-600">Home</a></li>
                            <li><a href="/book" className="text-gray-600 hover:text-blue-600">Book</a></li>
                            <li><a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a></li>
                        </ul>
                    </nav>
                </div>
            </header> */}

            {/* Hero Section */}
            <div className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4">Welcome to {organization.name}</h2>
                    <p className="text-xl max-w-2xl mx-auto">
                        {organization.description || 'Book your facilities and services easily with our online platform.'}
                    </p>
                    <a
                        href="/book"
                        className="mt-8 inline-block bg-white text-blue-600 font-medium py-3 px-8 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Book Now
                    </a>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {/* About Section */}
                <section className="mb-16">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">About Us</h3>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <p className="text-gray-700 mb-4">{organization.description || 'Welcome to our booking platform.'}</p>
                        {organization.branche && (
                            <p className="text-gray-600">Industry: <span className="font-medium">{organization.branche}</span></p>
                        )}
                    </div>
                </section>

                {/* Locations Section */}
                <section className="mb-16">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Our Locations</h3>
                    {organization.locations && organization.locations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organization.locations.map((location: Location) => (
                                <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <h4 className="text-xl font-semibold mb-2">{location.name}</h4>
                                        <p className="text-gray-600 mb-4">{location.address}</p>
                                        {location.postalCode && (
                                            <p className="text-gray-500 text-sm">{location.postalCode}, {location.country || ''}</p>
                                        )}
                                        <a
                                            href={`/book?location=${location.id}`}
                                            className="mt-4 inline-block text-blue-600 font-medium hover:text-blue-800"
                                        >
                                            Book at this location →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">No locations available yet.</p>
                        </div>
                    )}
                </section>

                {/* Contact Section */}
                <section id="contact" className="mb-16">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h3>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <p className="text-gray-700 mb-6">
                            Have questions or need assistance? Feel free to reach out to us.
                        </p>
                        <div className="flex justify-center">
                            <a
                                href="/contact"
                                className="inline-block bg-blue-600 text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h4 className="text-xl font-bold">{organization.name}</h4>
                            <p className="text-gray-400 mt-1">&copy; {new Date().getFullYear()} All rights reserved</p>
                        </div>
                        <div>
                            <ul className="flex space-x-6">
                                <li><a href="/terms" className="text-gray-400 hover:text-white">Terms</a></li>
                                <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a></li>
                                <li><a href="/faq" className="text-gray-400 hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        Powered by AppointPro
                    </div>
                </div>
            </footer>
        </div>
    );
} 