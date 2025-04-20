import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasActiveSubscription } from './services/stripe-subscription';
import { db } from './lib/server';

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
    '/'
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
        !['dashboard', 'subscription', 'api'].includes(segments[0]);
};

const availableLanguages = ['nl', 'en'];
const defaultLanguage = 'nl';

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

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

    // Allow access to public paths without authentication check
    if (isPublicPath(path)) {
        return NextResponse.next();
    }

    // Get the session token from cookies
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;

    if (!sessionToken) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    try {
        // Get the session from the database
        const session = await db.session.findUnique({
            where: { sessionToken },
            include: { user: { include: { organization: true } } },
        });

        if (!session) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const { user } = session;

        // Skip further checks if user or organization is missing
        if (!user || !user.organizationId) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        // Check organization-specific paths
        if (isOrganizationPath(path)) {
            const organizationSlug = path.split('/')[1]; // Extract organization name from path

            // Check if the user's organization matches the requested organization
            const userOrganization = user.organization?.name;

            if (!userOrganization || userOrganization.toLowerCase() !== organizationSlug.toLowerCase()) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        const organizationId = user.organizationId;

        // If user has role CLIENT, they don't need a subscription
        if (user.role === 'CLIENT') {
            return NextResponse.next();
        }

        // Only check subscription for non-CLIENT roles
        try {
            // Check if the user's organization has an active subscription
            const hasSubscription = await hasActiveSubscription(organizationId);

            // If the organization doesn't have an active subscription, redirect to subscription plans
            if (!hasSubscription) {
                return NextResponse.redirect(new URL('/subscription/plans', request.url));
            }

            // Update the last active subscription check timestamp
            await db.user.update({
                where: { id: user.id },
                data: { lastActiveSubscriptionCheck: new Date() },
            });

            return NextResponse.next();
        } catch (subscriptionError) {
            // If there's an error checking subscription, log it but allow access
            // This prevents a broken subscription check from blocking all user access
            console.error('Error checking subscription status:', subscriptionError);
            return NextResponse.next();
        }
    } catch (error) {
        // Log the error but don't block access to avoid login loops
        console.error('Error in middleware:', error);
        return NextResponse.next();
    }
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