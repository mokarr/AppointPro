/**
 * Enhanced API Middleware
 * 
 * This module provides enhanced middleware functions for API routes,
 * including session security, rate limiting, and response formatting.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateSessionIntegrity, monitorSessionActivity } from "@/lib/session-security";
import { logger } from "@/utils/logger";
import { errorResponse } from "./response";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/reset-password',
    '/api/auth/csrf'
];

/**
 * Check if a request path is public (doesn't require authentication)
 */
function isPublicPath(path: string): boolean {
    return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
}

/**
 * Authentication middleware
 * Verifies that the user is authenticated
 */
export async function authMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        const url = new URL(request.url);

        // Skip auth check for public paths
        if (isPublicPath(url.pathname)) {
            return handler(request);
        }

        // Get session
        const session = await auth();

        // If not authenticated, return 401
        if (!session?.user) {
            return errorResponse(
                "Authentication required",
                undefined,
                { status: 401, code: "UNAUTHENTICATED" }
            );
        }

        // Proceed with the request
        return handler(request);
    } catch (error) {
        logger.error("Authentication middleware error", {
            error: error instanceof Error ? error.message : String(error),
            url: request.url,
            method: request.method
        });

        return errorResponse(
            "Authentication error",
            undefined,
            { status: 500, code: "AUTH_ERROR" }
        );
    }
}

/**
 * Security headers middleware
 * Adds security-related headers to the response
 */
export function securityHeadersMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
        const response = await handler(request);

        // Add security headers
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

        // Content Security Policy - can be adjusted based on needs
        response.headers.set(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
        );

        return response;
    };
}

/**
 * Session security middleware
 * Validates session integrity and monitors for suspicious activity
 */
export async function sessionSecurityMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        const url = new URL(request.url);

        // Skip session checks for public paths
        if (isPublicPath(url.pathname)) {
            return handler(request);
        }

        // Create a response object for the session functions
        const tempResponse = new NextResponse();

        // Validate session integrity
        const isValid = await validateSessionIntegrity(request, tempResponse);
        if (!isValid) {
            return errorResponse(
                "Invalid session",
                undefined,
                { status: 401, code: "INVALID_SESSION" }
            );
        }

        // Monitor session activity for anomalies (doesn't block request)
        await monitorSessionActivity(request, tempResponse);

        // Proceed with the request
        const response = await handler(request);

        // Merge any cookies or headers set by the session functions
        tempResponse.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
                response.headers.set(key, value);
            }
        });

        return response;
    } catch (error) {
        logger.error("Session security middleware error", {
            error: error instanceof Error ? error.message : String(error),
            url: request.url,
            method: request.method,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return error response instead of proceeding with the request
        return errorResponse(
            "Session security error",
            undefined,
            { status: 500, code: "SESSION_ERROR" }
        );
    }
}

/**
 * Error handling middleware
 * Catches and logs errors, returns standardized error responses
 */
export function errorHandlingMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
        try {
            return await handler(request);
        } catch (error) {
            logger.error("API request error", {
                error: error instanceof Error ? error.message : String(error),
                url: request.url,
                method: request.method,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return errorResponse(
                "An unexpected error occurred",
                undefined,
                { status: 500, code: "SERVER_ERROR" }
            );
        }
    };
}

/**
 * Apply all API middleware to a handler function
 */
export function withApiMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
    // Apply middleware in the correct order (outermost first)
    return errorHandlingMiddleware(
        (request: NextRequest) => securityHeadersMiddleware(
            async (req: NextRequest) => sessionSecurityMiddleware(
                req,
                async (r: NextRequest) => authMiddleware(r, handler)
            )
        )(request)
    );
} 