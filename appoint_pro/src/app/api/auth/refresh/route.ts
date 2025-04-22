import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, generateToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { authRateLimitMiddleware } from "../middleware";

export async function POST(request: NextRequest) {
    try {
        // Check rate limiting first
        const rateLimitResponse = await authRateLimitMiddleware(request, 'login');
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        // Parse request body
        const body = await request.json();
        const { refreshToken } = body;

        // Check if refresh token is provided
        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token is required" },
                { status: 400 }
            );
        }

        // Try to generate new access token using the refresh token
        const newAccessToken = await refreshAccessToken(refreshToken);

        // If refresh token is invalid or expired
        if (!newAccessToken) {
            logger.warn("Invalid refresh token", {
                refreshToken: refreshToken.substring(0, 10) + '...',
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                { success: false, message: "Invalid or expired refresh token" },
                { status: 401 }
            );
        }

        // Log successful token refresh
        logger.info("Token refreshed successfully", {
            refreshToken: refreshToken.substring(0, 10) + '...',
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return new access token
        return NextResponse.json(
            {
                success: true,
                message: "Token refreshed successfully",
                data: {
                    accessToken: newAccessToken
                }
            },
            { status: 200 }
        );
    } catch (error) {
        // Log error
        logger.error("Error refreshing token", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return error response
        return NextResponse.json(
            { success: false, message: "Er is een fout opgetreden bij het vernieuwen van het token" },
            { status: 500 }
        );
    }
} 