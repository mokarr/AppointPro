import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { signInSchema } from "@/lib/zod";
import { verifyPassword } from "@/utils/password";
import { ZodError } from "zod";
import { logger } from "@/utils/logger";
import { signIn } from "@/lib/auth";
import { authRateLimitMiddleware } from "../middleware";

export async function POST(request: NextRequest) {
    // Check rate limiting first
    const rateLimitResponse = await authRateLimitMiddleware(request, 'login');
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // Parse request body
        const body = await request.json();

        // Validate request data
        const validatedData = await signInSchema.parseAsync(body);

        // Get client IP for logging
        const clientIp = request.headers.get("x-forwarded-for") || "unknown";

        // Find user by email
        const user = await db.user.findUnique({
            where: { email: validatedData.email.toLowerCase() },
            include: { organization: true }
        });

        // If user not found, return generic error
        if (!user || !user.password) {
            logger.warn("Login attempt with non-existent email", {
                email: validatedData.email.toLowerCase(),
                ip: clientIp
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "E-mailadres of wachtwoord is onjuist"
                },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(validatedData.password, user.password);

        if (!isPasswordValid) {
            logger.warn("Login attempt with incorrect password", {
                userId: user.id,
                email: user.email,
                ip: clientIp
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "E-mailadres of wachtwoord is onjuist"
                },
                { status: 401 }
            );
        }

        // Log successful login
        logger.info("User login successful", {
            userId: user.id,
            email: user.email,
            ip: clientIp
        });

        // Use NextAuth signIn programmatically
        try {
            await signIn("credentials", {
                email: validatedData.email,
                password: validatedData.password,
                redirect: false
            });

            // Return user data (without sensitive information)
            return NextResponse.json(
                {
                    success: true,
                    message: "Login successful",
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        organization: user.organization ? {
                            id: user.organization.id,
                            name: user.organization.name,
                            subdomain: user.organization.subdomain
                        } : null
                    }
                },
                { status: 200 }
            );
        } catch (signInError) {
            logger.error("NextAuth signIn error", {
                error: signInError instanceof Error ? signInError.message : String(signInError),
                userId: user.id,
                ip: clientIp
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Er is een fout opgetreden bij het inloggen"
                },
                { status: 500 }
            );
        }

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Login validation error", {
                errors: error.errors,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Validatiefout",
                    errors: error.errors
                },
                { status: 400 }
            );
        }

        // Log unexpected errors
        logger.error("Login error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json(
            {
                success: false,
                message: "Er is een fout opgetreden bij het inloggen"
            },
            { status: 500 }
        );
    }
} 