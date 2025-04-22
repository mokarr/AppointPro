/**
 * Role-based Authorization Middleware
 * 
 * This middleware handles role-based authorization for API routes,
 * ensuring users have appropriate permissions to access resources.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";

// Valid user roles in order of increasing privilege
export type UserRole = "CLIENT" | "STAFF" | "MANAGER" | "ADMIN";

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
    "CLIENT": 0,
    "STAFF": 1,
    "MANAGER": 2,
    "ADMIN": 3
};

/**
 * Check if a user has sufficient role privileges
 * 
 * @param userRole The user's role
 * @param requiredRole The minimum required role
 * @returns True if the user has sufficient privileges, false otherwise
 */
export function hasRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Middleware to check if the user has the required role
 * 
 * @param requiredRole The minimum role required to access the route
 * @returns Middleware function that checks user role
 */
export function requireRole(requiredRole: UserRole) {
    return async function roleMiddleware(
        request: NextRequest,
        next: () => Promise<NextResponse>
    ): Promise<NextResponse> {
        try {
            // Get authorization header
            const authHeader = request.headers.get("authorization");
            const token = authHeader?.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null;

            // If no token in header, check session
            if (!token) {
                // Check session with Next-Auth
                const session = await auth();

                // If no session or user, return 401 Unauthorized
                if (!session?.user) {
                    return NextResponse.json(
                        { success: false, message: "Authentication required" },
                        { status: 401 }
                    );
                }

                // Get user role from session
                const userRole = session.user.role as UserRole || "CLIENT";

                // Check if user has sufficient role
                if (!hasRolePermission(userRole, requiredRole)) {
                    return NextResponse.json(
                        { success: false, message: "Insufficient privileges" },
                        { status: 403 }
                    );
                }

                // User has sufficient role, continue
                return next();
            }

            // Verify JWT token
            const payload = await verifyToken(token);

            // If token is invalid, return 401 Unauthorized
            if (!payload) {
                return NextResponse.json(
                    { success: false, message: "Invalid or expired token" },
                    { status: 401 }
                );
            }

            // Get user role from token
            const userRole = payload.role as UserRole || "CLIENT";

            // Check if user has sufficient role
            if (!hasRolePermission(userRole, requiredRole)) {
                logger.warn("Insufficient privileges for access", {
                    userId: payload.sub,
                    userRole,
                    requiredRole,
                    path: request.nextUrl.pathname
                });

                return NextResponse.json(
                    { success: false, message: "Insufficient privileges" },
                    { status: 403 }
                );
            }

            // User has sufficient role, continue
            return next();
        } catch (error) {
            logger.error("Error in role authorization middleware", {
                error: error instanceof Error ? error.message : String(error),
                path: request.nextUrl.pathname
            });

            return NextResponse.json(
                { success: false, message: "Internal server error" },
                { status: 500 }
            );
        }
    };
}

/**
 * Middleware to get the user's role from the request
 * 
 * @param request The NextRequest object
 * @returns The user's role or null if not authenticated
 */
export async function getUserRole(request: NextRequest): Promise<UserRole | null> {
    try {
        // Get authorization header
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

        // If no token in header, check session
        if (!token) {
            // Check session with Next-Auth
            const session = await auth();

            // If no session or user, return null
            if (!session?.user) {
                return null;
            }

            // Get user role from session
            return (session.user.role as UserRole) || "CLIENT";
        }

        // Verify JWT token
        const payload = await verifyToken(token);

        // If token is invalid, return null
        if (!payload) {
            return null;
        }

        // Get user role from token
        return (payload.role as UserRole) || "CLIENT";
    } catch (error) {
        logger.error("Error getting user role", {
            error: error instanceof Error ? error.message : String(error),
            path: request.nextUrl.pathname
        });

        return null;
    }
} 