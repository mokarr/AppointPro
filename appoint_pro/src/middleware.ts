import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    '/organization-not-found', // Allow access to organization not found page
];

// Pages that are allowed to be accessed via subdomain
const allowedSubdomainPages = [
    '/', // Root path of the subdomain
    '/book', // Booking page
    '/services', // Services page
    '/contact', // Contact page
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

    // Initialize response
    let response = NextResponse.next();

    // Security headers - Apply to all responses
    // Content-Security-Policy
    const cspHeader = [
        // Default sources restriction
        "default-src 'self'",
        // Script sources
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.vercel-analytics.com https://plausible.io",
        // Style sources
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Font sources
        "font-src 'self' https://fonts.gstatic.com data:",
        // Image sources
        "img-src 'self' data: https://*.stripe.com https://avatars.githubusercontent.com https://*.googleusercontent.com blob:",
        // Connect sources (for API calls, WebSockets)
        "connect-src 'self' https://*.stripe.com https://*.vercel-analytics.com https://plausible.io",
        // Frame sources
        "frame-src 'self' https://*.stripe.com",
        // Form actions
        "form-action 'self'",
        // Object sources
        "object-src 'none'",
        // Base URI
        "base-uri 'self'",
        // Frame ancestors (control iframing)
        "frame-ancestors 'self'",
        // Upgrade insecure requests
        "upgrade-insecure-requests",
    ].join(';');

    // Set security headers
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    // Enhanced security headers
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    // Cookie policy
    response.headers.set('Set-Cookie', 'SameSite=Strict; Secure; HttpOnly; Path=/');

    // Set Strict-Transport-Security header (HSTS) for HTTPS
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    // Handle subdomain routing
    if (subdomain) {
        // Always allow access to the organization-not-found page
        if (pathname === '/organization-not-found') {
            return response;
        }

        // Check if the current path is allowed to be accessed via subdomain
        if (isAllowedSubdomainPage(pathname)) {
            // If accessing the root path, redirect to the organization page with subdomain
            if (pathname === '/') {
                const url = new URL(`/organization/${subdomain}`, request.url);
                return NextResponse.rewrite(url);
            }

            // Special case for booking page - redirect to appropriate booking page
            if (pathname === '/book' || pathname.startsWith('/book/')) {
                // Rewrite to the organization's booking page
                const url = new URL(`/organization/${subdomain}/book${pathname.replace('/book', '')}`, request.url);
                return NextResponse.rewrite(url);
            }

            // For other allowed paths (services, contact, etc.)
            if (pathname === '/services' || pathname.startsWith('/services/')) {
                const url = new URL(`/organization/${subdomain}/services${pathname.replace('/services', '')}`, request.url);
                return NextResponse.rewrite(url);
            }

            if (pathname === '/contact') {
                const url = new URL(`/organization/${subdomain}/contact`, request.url);
                return NextResponse.rewrite(url);
            }

            // For any other allowed paths added in the future
            return response;
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
        return response;
    }

    // Allow access to public organization pages
    if (isPublicOrganizationPage(pathname)) {
        return response;
    }

    // Allow access to the organization page for specific subdomains
    if (pathname.startsWith('/organization/')) {
        return response;
    }

    return response;
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