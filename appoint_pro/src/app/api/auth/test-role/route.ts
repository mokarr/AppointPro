import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { requireRole, getUserRole, UserRole } from "@/middlewares/role-auth";

// Handler for admin-only requests
async function handleAdminRequest(request: NextRequest) {
    try {
        // Get user role for informational purposes
        const userRole = await getUserRole(request);

        logger.info("Admin test endpoint accessed", {
            role: userRole,
            method: request.method,
            path: request.nextUrl.pathname,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: true,
            message: "You have admin access",
            data: {
                timestamp: new Date().toISOString(),
                role: userRole,
                accessLevel: "admin"
            }
        }, { status: 200 });
    } catch (error) {
        logger.error("Error in admin test endpoint", {
            error: error instanceof Error ? error.message : String(error),
            path: request.nextUrl.pathname
        });

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

// Middleware for admin access
const adminMiddleware = requireRole("ADMIN");

// Apply the admin role requirement middleware
export const GET = (request: NextRequest) => adminMiddleware(request, () => handleAdminRequest(request));

// Handler for manager-only requests
async function handleManagerRequest(request: NextRequest) {
    try {
        const userRole = await getUserRole(request);

        logger.info("Manager test endpoint accessed", {
            role: userRole,
            method: request.method,
            path: request.nextUrl.pathname,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: true,
            message: "You have manager access",
            data: {
                timestamp: new Date().toISOString(),
                role: userRole,
                accessLevel: "manager or higher"
            }
        }, { status: 200 });
    } catch (error) {
        logger.error("Error in manager test endpoint", {
            error: error instanceof Error ? error.message : String(error),
            path: request.nextUrl.pathname
        });

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

// Middleware for manager access
const managerMiddleware = requireRole("MANAGER");

// Apply the manager role requirement middleware
export const POST = (request: NextRequest) => managerMiddleware(request, () => handleManagerRequest(request));

// Handler for any authenticated user
async function handleClientRequest(request: NextRequest) {
    try {
        const userRole = await getUserRole(request);

        logger.info("Client test endpoint accessed", {
            role: userRole,
            method: request.method,
            path: request.nextUrl.pathname,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: true,
            message: "You have client access",
            data: {
                timestamp: new Date().toISOString(),
                role: userRole,
                accessLevel: "client or higher"
            }
        }, { status: 200 });
    } catch (error) {
        logger.error("Error in client test endpoint", {
            error: error instanceof Error ? error.message : String(error),
            path: request.nextUrl.pathname
        });

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

// Middleware for client access
const clientMiddleware = requireRole("CLIENT");

// Apply the client role requirement middleware
export const PUT = (request: NextRequest) => clientMiddleware(request, () => handleClientRequest(request)); 