/**
 * API Middleware
 * 
 * This module provides middleware functions for API routes,
 * including session security and validation.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateSessionIntegrity, monitorSessionActivity } from "@/lib/session-security";
import { logger } from "@/utils/logger";

/**
 * Session security middleware for API routes
 * Validates session integrity and monitors for suspicious activity
 */
export async function sessionSecurityMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // Skip session checks for authentication endpoints
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/auth/login') ||
            url.pathname.startsWith('/api/auth/register')) {
            return handler(request);
        }

        // Create a response object for the session functions
        const tempResponse = new NextResponse();

        // Validate session integrity
        const isValid = await validateSessionIntegrity(request, tempResponse);
        if (!isValid) {
            return NextResponse.json({
                success: false,
                message: "Invalid session"
            }, { status: 401 });
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

        // Allow the request to proceed even if security checks fail
        return handler(request);
    }
}

/**
 * Apply all API middleware to a handler function
 */
export function withApiMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
        // Apply session security middleware
        return sessionSecurityMiddleware(request, handler);
    };
} 