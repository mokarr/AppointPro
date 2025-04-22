import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { requestPasswordResetSchema } from "@/lib/zod";
import { logger } from "@/utils/logger";
import { authRateLimitMiddleware } from "../../middleware";
import crypto from "crypto";
import { addHours } from "date-fns";
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
        const validatedData = await requestPasswordResetSchema.parseAsync(body);

        // Find user by email
        const user = await db.user.findUnique({
            where: { email: validatedData.email.toLowerCase() }
        });

        // Always return success even if user not found (security best practice)
        // This prevents user enumeration attacks
        if (!user) {
            logger.info("Password reset requested for non-existent email", {
                email: validatedData.email.toLowerCase(),
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json({
                success: true,
                message: "Als dit e-mailadres in ons systeem bekend is, ontvangt u een e-mail met instructies om uw wachtwoord te herstellen."
            }, { status: 200 });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = addHours(new Date(), 24); // Token valid for 24 hours

        // Create or update reset token in database
        await db.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpires: expiresAt
            }
        });

        // Log token creation
        logger.info("Password reset token created", {
            userId: user.id,
            email: user.email,
            expires: expiresAt,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // In a real application, we would send an email here
        // For now, just simulate it with a log message
        logger.info("Password reset email would be sent here", {
            to: user.email,
            resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
        });

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Als dit e-mailadres in ons systeem bekend is, ontvangt u een e-mail met instructies om uw wachtwoord te herstellen."
        }, { status: 200 });

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Password reset validation error", {
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
        logger.error("Password reset request error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Er is een fout opgetreden bij het verwerken van uw verzoek"
        }, { status: 500 });
    }
} 