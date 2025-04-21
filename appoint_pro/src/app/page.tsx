import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Pages that are allowed to be accessed via subdomain
const allowedSubdomainPages = [
    '/', // Root path of the subdomain
    '/landing', // Organization landing page
    '/book', // Booking page
];

// Function to extract subdomain from host
function getSubdomain(host: string): string | null {
    // Local development handling
    if (host.includes('localhost')) {
        const parts = host.split('.');
        // If we have something like organization.localhost:3000
        if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
            return parts[0];
        }
        return null;
    }

    // Production handling
    const parts = host.split('.');
    // Example: organization.appointpro.com -> ['organization', 'appointpro', 'com']
    if (parts.length > 2 && parts[0] !== 'www') {
        return parts[0];
    }

    return null;
}

export default async function RootPage() {
    const headersList = await headers();
    const host = headersList.get('host');

    if (!host) {
        redirect('/landing/user');
        return null;
    }

    const subdomain = getSubdomain(host);

    // If a subdomain is found and we're at the root path (which is allowed),
    // redirect to the organization route
    if (subdomain) {
        redirect(`/${subdomain}`);
        return null;
    }

    // Otherwise redirect to the general landing page
    redirect('/landing/user');
    return null;
} 