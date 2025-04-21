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

// Check if the path is public
const isPublicPath = (path: string) => {
    return publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Check if a path is an organization-specific route
const isOrganizationPath = (path: string) => {
    // Match paths like /my-organization/* but not /dashboard, /sign-in, etc.
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 &&
        !publicPaths.some(p => path.startsWith(p)) &&
        !['dashboard', 'subscription', 'api', 'landing', 'search'].includes(segments[0]);
};

// Check if a path is a public organization page
const isPublicOrganizationPage = (path: string) => {
    if (!isOrganizationPath(path)) return false;
    const segments = path.split('/').filter(Boolean);
    // Allow access to organization landing page and booking page
    return segments.length <= 2 && (segments[1] === undefined || segments[1] === 'landing' || segments[1] === 'book');
};

const availableLanguages = ['nl', 'en'];
const defaultLanguage = 'nl';

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Redirect root path to customer landing page
    if (pathname === '/') {
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

    // Part 2: Check authentication and organization access
    const path = request.nextUrl.pathname;

    // Allow access to public paths
    if (isPublicPath(path)) {
        return NextResponse.next();
    }

    // Allow access to public organization pages
    if (isPublicOrganizationPage(path)) {
        return NextResponse.next();
    }

    // For all other organization paths, check authentication and subscription
    if (isOrganizationPath(path)) {
        const session = request.cookies.get('session')?.value;

        if (!session) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        try {
            const hasSubscription = await hasActiveSubscription(session);
            if (!hasSubscription) {
                return NextResponse.redirect(new URL('/subscription/plans', request.url));
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }
    }

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