import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import { requireRole } from "@/middlewares/role-auth";
import { z } from "zod";

// Validation schema for user update data
const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    image: z.string().url("Invalid image URL").optional(),
    role: z.enum(["CLIENT", "STAFF", "MANAGER", "ADMIN"]).optional(),
    organizationId: z.string().optional().nullable(),
});

/**
 * GET /api/admin/users/[id] - Get a specific user by ID
 */
async function getUserHandler(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Fetch user data
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                organizationId: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        subdomain: true,
                        branche: true,
                        description: true,
                        hasActiveSubscription: true
                    }
                },
                bookings: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        // If user not found
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Log admin access to user data
        logger.info("Admin accessed user details", {
            adminAccessing: request.headers.get("x-forwarded-for") || "unknown",
            userAccessed: userId
        });

        // Return user data
        return NextResponse.json({
            success: true,
            data: user
        }, { status: 200 });

    } catch (error) {
        logger.error("Error getting user details", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown",
            params
        });

        return NextResponse.json({
            success: false,
            message: "Error getting user details"
        }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/users/[id] - Update a specific user
 */
async function updateUserHandler(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Parse and validate request body
        const body = await request.json();
        const validatedData = await updateUserSchema.parseAsync(body);

        // Check if email is being changed and is already in use
        if (validatedData.email) {
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

        // Update user data
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                ...(validatedData.name && { name: validatedData.name }),
                ...(validatedData.email && { email: validatedData.email.toLowerCase() }),
                ...(validatedData.image && { image: validatedData.image }),
                ...(validatedData.role && { role: validatedData.role }),
                ...(validatedData.organizationId !== undefined && {
                    organizationId: validatedData.organizationId
                }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Log admin update of user
        logger.info("Admin updated user", {
            adminUpdating: request.headers.get("x-forwarded-for") || "unknown",
            userUpdated: userId,
            fieldsUpdated: Object.keys(validatedData)
        });

        // Return updated user data
        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        }, { status: 200 });

    } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: "Validation error",
                errors: error.errors
            }, { status: 400 });
        }

        logger.error("Error updating user", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown",
            params
        });

        return NextResponse.json({
            success: false,
            message: "Error updating user"
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/users/[id] - Delete a specific user
 */
async function deleteUserHandler(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Delete user
        await db.user.delete({
            where: { id: userId }
        });

        // Log admin deletion of user
        logger.info("Admin deleted user", {
            adminDeleting: request.headers.get("x-forwarded-for") || "unknown",
            deletedUser: user
        });

        // Return success response
        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        }, { status: 200 });

    } catch (error) {
        logger.error("Error deleting user", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown",
            params
        });

        return NextResponse.json({
            success: false,
            message: "Error deleting user"
        }, { status: 500 });
    }
}

// Apply admin role middleware to all handlers
export const GET = (request: NextRequest, context: { params: { id: string } }) =>
    requireRole("ADMIN")(request, () => getUserHandler(request, context));

export const PATCH = (request: NextRequest, context: { params: { id: string } }) =>
    requireRole("ADMIN")(request, () => updateUserHandler(request, context));

export const DELETE = (request: NextRequest, context: { params: { id: string } }) =>
    requireRole("ADMIN")(request, () => deleteUserHandler(request, context)); 