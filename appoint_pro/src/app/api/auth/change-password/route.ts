import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server";
import { changePasswordSchema } from "@/lib/zod";
import { verifyPassword, saltAndHashPassword } from "@/utils/password";
import { ZodError } from "zod";
import { logger } from "@/utils/logger";
import { authRateLimitMiddleware } from "../middleware";

export async function POST(request: NextRequest) {
    try {
        // Get current session
        const session = await auth();

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        // Apply rate limiting
        const rateLimitResponse = await authRateLimitMiddleware(request, 'reset-password');
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = await changePasswordSchema.parseAsync(body);

        // Get user from database with password
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                password: true,
                email: true
            }
        });

        // If user not found or password is missing
        if (!user || !user.password) {
            logger.error("User not found or password missing for change password", {
                userId: session.user.id,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                { success: false, message: "Gebruiker niet gevonden of wachtwoord ontbreekt" },
                { status: 404 }
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await verifyPassword(
            validatedData.currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            logger.warn("Invalid current password for change password", {
                userId: user.id,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                { success: false, message: "Huidig wachtwoord is onjuist" },
                { status: 400 }
            );
        }

        // Check if new password is different from current password
        if (validatedData.currentPassword === validatedData.newPassword) {
            return NextResponse.json(
                { success: false, message: "Nieuw wachtwoord moet verschillen van het huidige wachtwoord" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await saltAndHashPassword(validatedData.newPassword);

        // Update user's password
        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Log password change
        logger.info("Password changed successfully", {
            userId: user.id,
            email: user.email,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return success response
        return NextResponse.json(
            { success: true, message: "Wachtwoord succesvol gewijzigd" },
            { status: 200 }
        );

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Password change validation error", {
                errors: error.errors,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                { success: false, message: "Validatiefout", errors: error.errors },
                { status: 400 }
            );
        }

        // Log unexpected errors
        logger.error("Password change error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json(
            { success: false, message: "Er is een fout opgetreden bij het wijzigen van het wachtwoord" },
            { status: 500 }
        );
    }
} 