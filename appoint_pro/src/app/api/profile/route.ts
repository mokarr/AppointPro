import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/utils/logger";
import { withApiMiddleware } from "../middleware";
import { db } from "@/lib/server";

/**
 * Profile API route handler
 * Handles profile retrieval and updates with session security
 */
async function handler(request: NextRequest) {
    try {
        // Get current user session
        const session = await auth();

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({
                success: false,
                message: "Not authenticated"
            }, { status: 401 });
        }

        // Handle different methods
        switch (request.method) {
            case "GET":
                // Get user profile
                const user = await db.user.findUnique({
                    where: { id: session.user.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                        organizationId: true,
                        createdAt: true,
                        updatedAt: true,
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                subdomain: true,
                                hasActiveSubscription: true
                            }
                        }
                    }
                });

                if (!user) {
                    return NextResponse.json({
                        success: false,
                        message: "User not found"
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: user
                }, { status: 200 });

            case "PATCH":
                // Update user profile
                try {
                    const body = await request.json();
                    const { name, image } = body;

                    // Validate input
                    if (!name && !image) {
                        return NextResponse.json({
                            success: false,
                            message: "No data to update"
                        }, { status: 400 });
                    }

                    // Update user
                    const updatedUser = await db.user.update({
                        where: { id: session.user.id },
                        data: {
                            ...(name ? { name } : {}),
                            ...(image ? { image } : {})
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    });

                    return NextResponse.json({
                        success: true,
                        data: updatedUser
                    }, { status: 200 });

                } catch (error) {
                    logger.error("Profile update error", {
                        error: error instanceof Error ? error.message : String(error),
                        userId: session.user.id
                    });

                    return NextResponse.json({
                        success: false,
                        message: "Failed to update profile"
                    }, { status: 500 });
                }

            default:
                return NextResponse.json({
                    success: false,
                    message: "Method not allowed"
                }, { status: 405 });
        }

    } catch (error) {
        logger.error("Profile API error", {
            error: error instanceof Error ? error.message : String(error),
            method: request.method,
            url: request.url
        });

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}

// Export with middleware applied
export const GET = withApiMiddleware(handler);
export const PATCH = withApiMiddleware(handler); 