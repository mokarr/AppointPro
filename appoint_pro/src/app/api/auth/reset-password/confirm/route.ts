import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { confirmPasswordResetSchema } from "@/lib/zod";
import { logger } from "@/utils/logger";
import { saltAndHashPassword } from "@/utils/password";
import { authRateLimitMiddleware } from "../../middleware";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
    // Check rate limiting first
    const rateLimitResponse = await authRateLimitMiddleware(request, 'reset-password');
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // Parse and validate request body
        const body = await request.json();
        const validatedData = await confirmPasswordResetSchema.parseAsync(body);

        // Find user by reset token
        const user = await db.user.findFirst({
            where: {
                resetToken: validatedData.token,
                resetTokenExpires: {
                    gt: new Date() // Token must not be expired
                }
            }
        });

        // If token is invalid or expired
        if (!user) {
            logger.warn("Invalid or expired password reset token", {
                token: validatedData.token.substring(0, 8) + '...', // Only log part of the token for security
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json({
                success: false,
                message: "Ongeldige of verlopen token. Vraag een nieuwe wachtwoordherstel aan."
            }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await saltAndHashPassword(validatedData.password);

        // Update user's password and clear reset token
        await db.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        });

        // Log successful password reset
        logger.info("Password reset successful", {
            userId: user.id,
            email: user.email,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Wachtwoord succesvol gewijzigd. U kunt nu inloggen met uw nieuwe wachtwoord."
        }, { status: 200 });

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Password reset confirmation validation error", {
                errors: error.errors,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json({
                success: false,
                message: "Validatiefout",
                errors: error.errors
            }, { status: 400 });
        }

        // Log unexpected errors
        logger.error("Password reset confirmation error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Er is een fout opgetreden bij het wijzigen van uw wachtwoord"
        }, { status: 500 });
    }
} 