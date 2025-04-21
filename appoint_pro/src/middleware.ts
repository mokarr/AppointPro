import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasActiveSubscription } from './services/stripe-subscription';

// Paths that don't require an active subscription
const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/api/auth',
    '/api/webhooks',
    '/subscription/plans',
    '/subscription/success',
    '/subscription/cancel',
    '/api/subscriptions',  // Add all subscription related API paths
    '/_next',             // Add Next.js internal paths
    '/favicon.ico',
    '/landing/company',   // Allow access to company landing pages
    '/landing/user',      // Allow access to user landing pages
];

// Pages that are allowed to be accessed via subdomain
const allowedSubdomainPages = [
    '/', // Root path of the subdomain
    '/book', // Booking page
];

// Check if the path is public
const isPublicPath = (path: string) => {
    return publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Check if a path is a public organization page
const isPublicOrganizationPage = (path: string) => {
    // Since we've removed the [organization] route, this now checks for company and user landing pages
    return path.startsWith('/landing/company/') || path.startsWith('/landing/user/');
};

// Check if a path is allowed to be accessed via subdomain
const isAllowedSubdomainPage = (path: string) => {
    return allowedSubdomainPages.includes(path) ||
        allowedSubdomainPages.some(allowedPath =>
            path === allowedPath ||
            (allowedPath !== '/' && path.startsWith(allowedPath + '/'))
        );
};

const availableLanguages = ['nl', 'en'];
const defaultLanguage = 'nl';

// Extract subdomain from host
const getSubdomain = (host: string): string | null => {
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
};

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const host = request.headers.get('host') || '';
    const subdomain = getSubdomain(host);

    // Handle subdomain routing
    if (subdomain) {
        // Check if the current path is allowed to be accessed via subdomain
        if (isAllowedSubdomainPage(pathname)) {
            // If accessing the root path, redirect to the company landing page
            if (pathname === '/') {
                return NextResponse.rewrite(new URL(`/landing/company/${subdomain}`, request.url));
            }

            // Special case for booking page - redirect to appropriate booking page
            if (pathname === '/book' || pathname.startsWith('/book/')) {
                // Implementation depends on how booking pages are structured
                // For example, if booking is part of the company landing:
                return NextResponse.rewrite(new URL(`/landing/company/${subdomain}/book${pathname.replace('/book', '')}`, request.url));
                // Or if there's a dedicated booking route:
                // return NextResponse.rewrite(new URL(`/booking/${subdomain}${pathname.replace('/book', '')}`, request.url));
            }

            // For other allowed paths (if any are added in the future)
            // This might need customization based on your routing structure
            return NextResponse.next();
        } else {
            // For non-allowed pages, redirect to the main domain
            const url = request.nextUrl.clone();
            url.host = host.replace(`${subdomain}.`, '');
            return NextResponse.redirect(url);
        }
    }

    // Redirect root path to customer landing page (keep existing behavior)
    if (pathname === '/' && !subdomain) {
        return NextResponse.redirect(new URL('/landing/user', request.url));
    }

    // Part 1: Handle language setting via query parameter
    let shouldRedirect = false;
    const url = request.nextUrl.clone();

    // Check if URL already has lang parameter with valid value
    const hasValidLangParam = searchParams.has('lang') &&
        availableLanguages.includes(searchParams.get('lang') as string);

    // Set language parameter if not present or invalid
    if (!hasValidLangParam) {
        // Get the preferred language from the Accept-Language header
        const acceptLanguage = request.headers.get('accept-language');
        let preferredLanguage = defaultLanguage;

        if (acceptLanguage) {
            const languages = acceptLanguage.split(',').map((lang) => lang.split(';')[0].toLowerCase());
            preferredLanguage = languages.find((lang) => availableLanguages.includes(lang)) || defaultLanguage;
        }

        url.searchParams.set('lang', preferredLanguage);
        shouldRedirect = true;
    }

    // If language was adjusted, redirect to the URL with the proper language param
    if (shouldRedirect) {
        return NextResponse.redirect(url);
    }

    // Allow access to public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Allow access to public organization pages
    if (isPublicOrganizationPage(pathname)) {
        return NextResponse.next();
    }

    // The organization paths no longer exist, so we don't need to check subscription
    // for organization-specific routes anymore

    return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}; 