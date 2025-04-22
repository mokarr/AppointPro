import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/utils/logger";

export async function GET(request: NextRequest) {
    try {
        // Get current session
        const session = await auth();

        // If not authenticated, return 401 Unauthorized
        if (!session || !session.user) {
            return NextResponse.json({
                success: false,
                message: "Authentication required"
            }, { status: 401 });
        }

        // Get user's role from session
        const role = session.user.role;

        // Different responses based on user role
        let data: Record<string, any> = {
            userId: session.user.id,
            email: session.user.email,
            role: role,
            timestamp: new Date().toISOString()
        };

        // Role-specific content
        switch (role) {
            case "ADMIN":
                data.message = "Welcome, Administrator! You have full access.";
                data.capabilities = ["manage_users", "manage_settings", "view_analytics", "manage_facilities"];
                break;
            case "MANAGER":
                data.message = "Welcome, Manager! You have management access.";
                data.capabilities = ["manage_facilities", "view_analytics"];
                break;
            case "CLIENT":
                data.message = "Welcome, Client! You have client-level access.";
                data.capabilities = ["book_appointments", "view_profile"];
                break;
            default:
                data.message = "Welcome! You have basic access.";
                data.capabilities = ["view_profile"];
                break;
        }

        // Log access to protected route
        logger.info("Access to protected route", {
            userId: session.user.id,
            role: role,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return role-specific response
        return NextResponse.json({
            success: true,
            data
        }, { status: 200 });

    } catch (error) {
        logger.error("Protected route error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
} 