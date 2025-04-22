import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import { requireRole } from "@/middlewares/role-auth";
import { ZodError, z } from "zod";

// Define schema for profile update validation
const profileUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    image: z.string().url("Invalid image URL").optional(),
});

/**
 * PATCH /api/profile/update - Update the current user's profile
 */
async function updateProfileHandler(request: NextRequest) {
    try {
        // Get current session
        const session = await auth();

        // If not authenticated, return 401
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                message: "Authentication required"
            }, { status: 401 });
        }

        // Get user ID from session
        const userId = session.user.id;

        // Parse and validate request body
        const body = await request.json();
        const validatedData = await profileUpdateSchema.parseAsync(body);

        // Check if email is being changed
        if (validatedData.email && validatedData.email !== session.user.email) {
            // Check if new email is already in use
            const existingUser = await db.user.findUnique({
                where: { email: validatedData.email.toLowerCase() }
            });

            if (existingUser && existingUser.id !== userId) {
                return NextResponse.json({
                    success: false,
                    message: "Email is already in use"
                }, { status: 409 });
            }
        }

        // Update user profile
        const updatedProfile = await db.user.update({
            where: { id: userId },
            data: {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.email && { email: validatedData.email.toLowerCase() }),
                ...(validatedData.image && { image: validatedData.image }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                emailVerified: true,
                updatedAt: true
            }
        });

        // Log profile update
        logger.info("User profile updated", {
            userId,
            updatedFields: Object.keys(validatedData),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return updated profile data
        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedProfile
        }, { status: 200 });

    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.warn("Profile update validation error", {
                errors: error.errors,
                ip: request.headers.get("x-forwarded-for") || "unknown"
            });

            return NextResponse.json({
                success: false,
                message: "Validation error",
                errors: error.errors
            }, { status: 400 });
        }

        // Log other errors
        logger.error("Error updating user profile", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Error updating user profile"
        }, { status: 500 });
    }
}

// Apply middleware and handle the PATCH request
export const PATCH = (request: NextRequest) =>
    requireRole("CLIENT")(request, () => updateProfileHandler(request)); 