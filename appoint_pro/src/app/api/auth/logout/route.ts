import { NextRequest, NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { logger } from "@/utils/logger";
import { blacklistToken, revokeRefreshToken } from "@/utils/jwt";

export async function POST(request: NextRequest) {
    try {
        // Get current session
        const session = await auth();

        // Get authorization header to check for JWT token
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

        // Parse request body for refresh token
        const body = await request.json().catch(() => ({}));
        const { refreshToken } = body;

        // Log the logout attempt
        if (session?.user) {
            logger.info("User logout", {
                userId: session.user.id,
                email: session.user.email,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });
        }

        // If we have a JWT token, blacklist it
        if (token) {
            await blacklistToken(token);
        }

        // If we have a refresh token, revoke it
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }

        // Call the Next.js signOut function
        await signOut({ redirect: false });

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Logout successful"
        }, { status: 200 });

    } catch (error) {
        logger.error("Logout error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Er is een fout opgetreden bij het uitloggen"
        }, { status: 500 });
    }
} 