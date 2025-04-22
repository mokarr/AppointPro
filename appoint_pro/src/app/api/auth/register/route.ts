import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { signUpSchema } from "@/lib/zod";
import { saltAndHashPassword } from "@/utils/password";
import { generateSubdomainFromName } from "@/lib/actions";
import { ZodError } from "zod";
import { logger } from "@/utils/logger";
import { authRateLimitMiddleware } from "../middleware";

export async function POST(request: NextRequest) {
    // Check rate limiting first
    const rateLimitResponse = await authRateLimitMiddleware(request, 'register');
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // Parse request body
        const body = await request.json();

        // Validate request data
        const validatedData = await signUpSchema.parseAsync(body);

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email: validatedData.email.toLowerCase() }
        });

        if (existingUser) {
            logger.warn("Registration attempt with existing email", {
                email: validatedData.email.toLowerCase(),
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Er bestaat al een account met dit e-mailadres"
                },
                { status: 409 }
            );
        }

        // Hash password
        const pwHash = await saltAndHashPassword(validatedData.password);

        // Generate subdomain from organization name
        const subdomain = generateSubdomainFromName(validatedData.name);

        // Check if subdomain is already in use
        const existingOrg = await db.organization.findFirst({
            where: { subdomain }
        });

        // If subdomain is taken, add a random suffix
        const finalSubdomain = existingOrg
            ? `${subdomain}-${Math.floor(1000 + Math.random() * 9000)}`
            : subdomain;

        // Create organization with location
        const organization = await db.organization.create({
            data: {
                name: validatedData.name,
                branche: validatedData.branche,
                description: validatedData.branche,
                subdomain: finalSubdomain,
                locations: {
                    create: {
                        name: "Hoofdlocatie",
                        address: validatedData.address,
                        postalCode: validatedData.postalcode,
                        country: validatedData.country,
                    },
                },
            },
        });

        // Create user
        const user = await db.user.create({
            data: {
                email: validatedData.email.toLowerCase(),
                password: pwHash,
                name: validatedData.name, // Also store name in user record
                organizationId: organization.id,
                role: 'ADMIN',
            },
        });

        // Log successful registration
        logger.info("User registration successful", {
            userId: user.id,
            email: user.email,
            organizationId: organization.id,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return success response (without sensitive data)
        return NextResponse.json(
            {
                success: true,
                message: "Account succesvol aangemaakt",
                data: {
                    userId: user.id,
                    email: user.email,
                    organizationId: organization.id,
                    organizationName: organization.name,
                }
            },
            { status: 201 }
        );

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Registration validation error", {
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
        logger.error("Registration error", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json(
            {
                success: false,
                message: "Er is een fout opgetreden bij het registreren"
            },
            { status: 500 }
        );
    }
} 