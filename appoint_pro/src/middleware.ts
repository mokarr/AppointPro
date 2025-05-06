import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCypressTestSubdomain } from '@/middleware-test-helper';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Paths that don't require an active subscription
const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/api/auth',
    '/api/webhooks',
    '/subscription/plans',
    '/subscription/success',
    '/subscription/cancel',
    '/api/subscriptions',
    '/_next',
    '/favicon.ico',
    '/landing/company',
    '/landing/user',
];

// Pages that are allowed to be accessed via subdomain
const allowedSubdomainPages = [
    '/',
    '/book',
    '/book/facilities',
    '/book/confirmation',
    '/book/confirmation/success',
];

// Check if the path is public
const isPublicPath = (path: string) => {
    // Direct check for the exact path
    if (publicPaths.some(publicPath => path === publicPath)) {
        return true;
    }

    // Check if it starts with any of the public paths
    if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
        return true;
    }

    // Check for locale prefixed paths by removing locale prefix first
    const pathWithoutLocale = path.replace(/^\/(en|nl)/, '');
    if (publicPaths.some(publicPath => pathWithoutLocale === publicPath || pathWithoutLocale.startsWith(publicPath))) {
        return true;
    }

    return false;
};

// Check if the path is an API route
const isApiRoute = (path: string) => {
    return path.startsWith('/api/');
};

// Extract subdomain from host
const getSubdomain = (host: string, userAgent?: string | null): string | null => {
    // First check if this is a Cypress test with a specific subdomain
    const cypressSubdomain = userAgent ? getCypressTestSubdomain(userAgent) : null;
    if (cypressSubdomain) {
        console.log('Detected Cypress test subdomain:', cypressSubdomain);
        return cypressSubdomain;
    }

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
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';
    const userAgent = request.headers.get('user-agent');
    const subdomain = getSubdomain(host, userAgent);

    // 1. If API route (except subdomain check), skip all subdomain/i18n logic
    if (isApiRoute(pathname)) {
        console.log('🔍 Skipping middleware for API route:', pathname);
        return NextResponse.next();
    }

    // 2. If subdomain is present and NOT an API route, check organization
    if (subdomain && !isApiRoute(pathname)) {
        try {
            const apiUrl = new URL(`/api/organizations/check-subdomain?subdomain=${subdomain}`, request.url);
            console.log('Checking organization at URL:', apiUrl.toString());

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                console.log('Organization check failed with status:', response.status);
                return NextResponse.rewrite(new URL('/not-found', request.url));
            }

            const data = await response.json();
            console.log('Organization check response:', data);

            if (!data.exists) {
                console.log('Organization does not exist, redirecting to not-found');
                return NextResponse.rewrite(new URL('/not-found', request.url));
            }

            const organizationId = data.organizationId;

            // Special handling for subdomain root path (/, /en, /nl): always redirect to /{locale}/landing
            //TODO: FIX THIS IT needs to redirect to the correct subdomain
            if (pathname === '/' || pathname === '/en' || pathname === '/nl') {
                const handleI18nRouting = createMiddleware(routing);
                const i18nResponse = handleI18nRouting(request);
                let locale: 'en' | 'nl' = routing.defaultLocale;
                if (i18nResponse instanceof Response) {
                    const location = i18nResponse.headers.get('Location');
                    if (location) {
                        const match = location.match(/^\/([a-z]{2})(?:\/|$)/);
                        if (match && (match[1] === 'en' || match[1] === 'nl')) locale = match[1];
                    }
                }
                // Always redirect to /{locale}/landing
                const landingUrl = new URL(`/${locale}/landing`, request.url);
                const response = NextResponse.redirect(landingUrl);
                response.headers.set('x-organizationSubdomainId', organizationId);
                return response;
            }

            // For all other paths, pass through to i18n middleware with organization ID
            const handleI18nRouting = createMiddleware(routing);
            const i18nResponse = handleI18nRouting(request);
            if (i18nResponse instanceof Response) {
                const headers = new Headers(i18nResponse.headers);
                headers.set('x-organizationSubdomainId', organizationId);
                return new Response(i18nResponse.body, {
                    status: i18nResponse.status,
                    statusText: i18nResponse.statusText,
                    headers: headers,
                });
            } else if (!i18nResponse) {
                const response = NextResponse.next();
                response.headers.set('x-organizationSubdomainId', organizationId);
                return response;
            }
            return i18nResponse;
        } catch (error) {
            console.error('Error checking organization existence:', error);
            return NextResponse.rewrite(new URL('/not-found', request.url));
        }
    }

    // 3. Handle non-subdomain requests
    if (pathname === '/' && !subdomain) {
        console.log('🔍 Redirecting root path to /landing/user');
        return NextResponse.redirect(new URL('/landing/user', request.url));
    }

    // 4. All other requests: use i18n middleware
    console.log('🔍 Using i18n middleware for path:', pathname);
    const handleI18nRouting = createMiddleware(routing);
    return handleI18nRouting(request);
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        // Match all paths except API routes and specific static assets
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',

        // Include root path explicitly
        '/',

        // Include our API route for checking subdomains
        '/api/organizations/check-subdomain',

        // Explicitly include locale paths
        '/(nl|en)/:path*'
    ],
};