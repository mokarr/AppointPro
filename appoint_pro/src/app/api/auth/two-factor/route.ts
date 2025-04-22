import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/utils/logger";
import {
    generateTwoFactorSecret,
    verifyTwoFactorToken,
    enableTwoFactor,
    disableTwoFactor,
    generateBackupCodes,
    verifyBackupCode,
    isTwoFactorEnabled
} from "@/lib/two-factor";
import { withApiMiddleware } from "../../middleware";

// Handler for 2FA API requests
async function handler(request: NextRequest) {
    try {
        // Get session and ensure user is authenticated
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Handle different request methods
        switch (request.method) {
            case "GET":
                // Check 2FA status
                const is2faEnabled = await isTwoFactorEnabled(userId);
                return NextResponse.json({
                    success: true,
                    enabled: is2faEnabled
                });

            case "POST":
                return await handlePostRequest(request, userId);

            default:
                return NextResponse.json(
                    { success: false, message: "Method not allowed" },
                    { status: 405 }
                );
        }
    } catch (error) {
        logger.error("Two-factor authentication error", {
            error: error instanceof Error ? error.message : String(error),
            method: request.method,
        });

        return NextResponse.json(
            { success: false, message: "Server error processing 2FA request" },
            { status: 500 }
        );
    }
}

// Process POST requests based on action
async function handlePostRequest(request: NextRequest, userId: string) {
    const body = await request.json();
    const { action, token, backupCode } = body;

    if (!action) {
        return NextResponse.json(
            { success: false, message: "Action is required" },
            { status: 400 }
        );
    }

    switch (action) {
        case "setup":
            // Generate a new secret and QR code for setup
            try {
                const setupData = await generateTwoFactorSecret(userId);
                return NextResponse.json({
                    success: true,
                    secret: setupData.secret,
                    qrCodeUrl: setupData.qrCodeUrl
                });
            } catch (error) {
                logger.error("2FA setup error", {
                    error: error instanceof Error ? error.message : String(error),
                    userId
                });
                return NextResponse.json(
                    { success: false, message: "Failed to generate 2FA setup" },
                    { status: 500 }
                );
            }

        case "verify":
            // Verify a token during setup
            if (!token) {
                return NextResponse.json(
                    { success: false, message: "Token is required" },
                    { status: 400 }
                );
            }

            const isValid = await verifyTwoFactorToken(userId, token);
            return NextResponse.json({ success: true, valid: isValid });

        case "enable":
            // Enable 2FA (verify and activate)
            if (!token) {
                return NextResponse.json(
                    { success: false, message: "Token is required" },
                    { status: 400 }
                );
            }

            try {
                const enabled = await enableTwoFactor(userId, token);

                if (!enabled) {
                    return NextResponse.json(
                        { success: false, message: "Invalid verification code" },
                        { status: 400 }
                    );
                }

                // Generate backup codes for the user
                const backupCodes = await generateBackupCodes(userId);

                return NextResponse.json({
                    success: true,
                    enabled: true,
                    backupCodes
                });
            } catch (error) {
                logger.error("2FA enable error", {
                    error: error instanceof Error ? error.message : String(error),
                    userId
                });
                return NextResponse.json(
                    { success: false, message: "Failed to enable 2FA" },
                    { status: 500 }
                );
            }

        case "disable":
            // Disable 2FA
            if (!token && !backupCode) {
                return NextResponse.json(
                    { success: false, message: "Verification code or backup code is required" },
                    { status: 400 }
                );
            }

            try {
                let disabled = false;

                if (token) {
                    disabled = await disableTwoFactor(userId, token);
                } else if (backupCode) {
                    const isValidBackupCode = await verifyBackupCode(userId, backupCode);

                    if (isValidBackupCode) {
                        // Disable 2FA without requiring TOTP (using backup code)
                        // This would need custom implementation since our disableTwoFactor requires a token
                        // Could implement this in the future
                        return NextResponse.json(
                            { success: false, message: "Disabling with backup code not implemented" },
                            { status: 501 }
                        );
                    }
                }

                if (!disabled) {
                    return NextResponse.json(
                        { success: false, message: "Invalid verification code" },
                        { status: 400 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    enabled: false
                });
            } catch (error) {
                logger.error("2FA disable error", {
                    error: error instanceof Error ? error.message : String(error),
                    userId
                });
                return NextResponse.json(
                    { success: false, message: "Failed to disable 2FA" },
                    { status: 500 }
                );
            }

        case "generate-backup-codes":
            // Generate new backup codes
            try {
                const backupCodes = await generateBackupCodes(userId);
                return NextResponse.json({
                    success: true,
                    backupCodes
                });
            } catch (error) {
                logger.error("Backup code generation error", {
                    error: error instanceof Error ? error.message : String(error),
                    userId
                });
                return NextResponse.json(
                    { success: false, message: "Failed to generate backup codes" },
                    { status: 500 }
                );
            }

        default:
            return NextResponse.json(
                { success: false, message: "Unknown action" },
                { status: 400 }
            );
    }
}

export const GET = withApiMiddleware(handler);
export const POST = withApiMiddleware(handler); 