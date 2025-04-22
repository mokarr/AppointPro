import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/utils/logger";
import { getCsrfToken, rotateSession, validateCsrfToken, destroySession } from "@/lib/session";

// GET endpoint to retrieve session information
export async function GET(request: NextRequest) {
    try {
        // Use the auth() function to get the session
        const session = await auth();

        // Generate a CSRF token for the session
        const csrfToken = await getCsrfToken(request, new NextResponse());

        // If not authenticated
        if (!session || !session.user) {
            return NextResponse.json({
                authenticated: false,
                user: null,
                csrfToken,
            }, { status: 200 });
        }

        // Filter out sensitive data for the response
        const { password, ...safeUserData } = session.user as any;

        // Return the session data
        return NextResponse.json({
            authenticated: true,
            user: safeUserData,
            csrfToken,
        }, { status: 200 });

    } catch (error) {
        logger.error("Session check error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            authenticated: false,
            error: "Failed to check authentication status"
        }, { status: 500 });
    }
}

// POST endpoint for session actions (rotate, validate, etc.)
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { action, csrfToken } = data;

        if (!action) {
            return NextResponse.json({
                success: false,
                message: "Missing required action parameter"
            }, { status: 400 });
        }

        // Create response object
        const response = new NextResponse();

        // All actions except 'validate' require CSRF token validation
        if (action !== 'validate' && csrfToken) {
            const isValid = await validateCsrfToken(request, response, csrfToken);
            if (!isValid) {
                logger.warn("Invalid CSRF token in session action", {
                    action,
                    ip: request.headers.get("x-forwarded-for") || "unknown"
                });

                return NextResponse.json({
                    success: false,
                    message: "Invalid CSRF token"
                }, { status: 403 });
            }
        }

        // Handle different actions
        switch (action) {
            case 'rotate':
                // Rotate the session (useful after password change, etc.)
                const rotatedSession = await rotateSession(request, response);
                if (rotatedSession) {
                    logger.info("Session rotated successfully", {
                        sessionId: rotatedSession.sessionId,
                        userId: rotatedSession.userId
                    });

                    return NextResponse.json({
                        success: true,
                        message: "Session rotated successfully",
                        csrfToken: rotatedSession.csrfToken
                    }, { status: 200 });
                }
                break;

            case 'validate':
                // Validate a CSRF token
                if (!csrfToken) {
                    return NextResponse.json({
                        success: false,
                        message: "Missing CSRF token"
                    }, { status: 400 });
                }

                const isValidToken = await validateCsrfToken(request, response, csrfToken);
                return NextResponse.json({
                    success: isValidToken,
                    valid: isValidToken
                }, { status: isValidToken ? 200 : 403 });

            case 'destroy':
                // Destroy the session (alternative to logout)
                const destroyed = await destroySession(request, response);
                if (destroyed) {
                    return NextResponse.json({
                        success: true,
                        message: "Session destroyed successfully"
                    }, { status: 200 });
                }
                break;

            case 'refresh-csrf':
                // Get a fresh CSRF token
                const newCsrfToken = await getCsrfToken(request, response);
                return NextResponse.json({
                    success: true,
                    csrfToken: newCsrfToken
                }, { status: 200 });

            default:
                return NextResponse.json({
                    success: false,
                    message: "Unknown action"
                }, { status: 400 });
        }

        // If we reach here, the action didn't complete successfully
        return NextResponse.json({
            success: false,
            message: "Session action failed"
        }, { status: 500 });

    } catch (error) {
        logger.error("Session action error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            error: "Failed to perform session action"
        }, { status: 500 });
    }
} 