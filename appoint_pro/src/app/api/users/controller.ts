/**
 * Users Controller
 * 
 * Controller for managing user endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/lib/api/base-controller";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    forbiddenResponse
} from "@/lib/api/response";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/utils/password";

export class UserController extends BaseController {
    constructor() {
        super({ resourceName: "user" });
    }

    /**
     * Get all users with optional filtering (admin only)
     */
    async getAll(request: NextRequest): Promise<NextResponse> {
        try {
            // Get the current user session
            const session = await auth();

            // Check if the current user is an admin
            if (!session?.user || session.user.role !== "ADMIN") {
                return forbiddenResponse("Only administrators can view all users");
            }

            const url = new URL(request.url);

            // Pagination
            const page = parseInt(url.searchParams.get("page") || "1", 10);
            const limit = parseInt(url.searchParams.get("limit") || "10", 10);
            const skip = (page - 1) * limit;

            // Filters
            const email = url.searchParams.get("email");
            const name = url.searchParams.get("name");
            const role = url.searchParams.get("role");
            const organizationId = url.searchParams.get("organizationId");

            // Build filter object
            const where: any = {};

            if (email) {
                where.email = {
                    contains: email,
                    mode: 'insensitive'
                };
            }

            if (name) {
                where.name = {
                    contains: name,
                    mode: 'insensitive'
                };
            }

            if (role) {
                where.role = role;
            }

            if (organizationId) {
                where.organizationId = organizationId;
            }

            // Get users with pagination
            const [users, total] = await Promise.all([
                db.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        emailVerified: true,
                        image: true,
                        createdAt: true,
                        updatedAt: true,
                        organizationId: true,
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                subdomain: true
                            }
                        }
                    }
                }),
                db.user.count({ where })
            ]);

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            return successResponse(
                users,
                "Users retrieved successfully",
                {
                    page,
                    limit,
                    total,
                    pages: totalPages
                }
            );
        } catch (error) {
            logger.error("Error retrieving users", {
                error: error instanceof Error ? error.message : String(error)
            });

            return errorResponse(
                "Failed to retrieve users",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Get a user by ID
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            // Check if user is authorized to view this user profile
            if (!session?.user || (session.user.id !== id && session.user.role !== "ADMIN")) {
                return forbiddenResponse("You do not have permission to view this user");
            }

            const user = await db.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                    organizationId: true,
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            subdomain: true
                        }
                    },
                    bookings: {
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!user) {
                return notFoundResponse("user");
            }

            return successResponse(user, "User retrieved successfully");
        } catch (error) {
            logger.error("Error retrieving user", {
                error: error instanceof Error ? error.message : String(error),
                userId: params.id
            });

            return errorResponse(
                "Failed to retrieve user",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Create a new user (admin only)
     */
    async create(request: NextRequest): Promise<NextResponse> {
        try {
            // Get the current user session
            const session = await auth();

            // Check if the current user is an admin
            if (!session?.user || session.user.role !== "ADMIN") {
                return forbiddenResponse("Only administrators can create users");
            }

            const data = await request.json();

            // Hash the password
            const hashedPassword = await hashPassword(data.password);

            // Create the user
            const user = await db.user.create({
                data: {
                    name: data.name,
                    email: data.email.toLowerCase(),
                    password: hashedPassword,
                    role: data.role || "CLIENT",
                    ...(data.organizationId && {
                        organization: {
                            connect: { id: data.organizationId }
                        }
                    })
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    organizationId: true
                }
            });

            return successResponse(
                user,
                "User created successfully",
                undefined,
                { status: 201 }
            );
        } catch (error) {
            logger.error("Error creating user", {
                error: error instanceof Error ? error.message : String(error)
            });

            // Check for duplicate email error
            if (error instanceof Error && error.message.includes("unique constraint")) {
                return errorResponse(
                    "A user with this email already exists",
                    undefined,
                    { status: 409, code: "EMAIL_EXISTS" }
                );
            }

            return errorResponse(
                "Failed to create user",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Update an existing user
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            // Check if user is authorized to update this user profile
            if (!session?.user || (session.user.id !== id && session.user.role !== "ADMIN")) {
                return forbiddenResponse("You do not have permission to update this user");
            }

            const data = await request.json();

            // Check if user exists
            const existingUser = await db.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return notFoundResponse("user");
            }

            // Prepare update data
            const updateData: any = {};

            if (data.name !== undefined) {
                updateData.name = data.name;
            }

            if (data.email !== undefined) {
                updateData.email = data.email.toLowerCase();
            }

            // Only admin can update role
            if (data.role !== undefined && session.user.role === "ADMIN") {
                updateData.role = data.role;
            }

            // Only admin can update organization
            if (data.organizationId !== undefined && session.user.role === "ADMIN") {
                updateData.organizationId = data.organizationId;
            }

            // If password is provided, hash it
            if (data.password) {
                updateData.password = await hashPassword(data.password);
            }

            // Update the user
            const user = await db.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    image: true,
                    updatedAt: true,
                    organizationId: true,
                    organization: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return successResponse(user, "User updated successfully");
        } catch (error) {
            logger.error("Error updating user", {
                error: error instanceof Error ? error.message : String(error),
                userId: params.id
            });

            // Check for duplicate email error
            if (error instanceof Error && error.message.includes("unique constraint")) {
                return errorResponse(
                    "A user with this email already exists",
                    undefined,
                    { status: 409, code: "EMAIL_EXISTS" }
                );
            }

            return errorResponse(
                "Failed to update user",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Delete a user
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            // Check if user is authorized to delete this user
            if (!session?.user || (session.user.id !== id && session.user.role !== "ADMIN")) {
                return forbiddenResponse("You do not have permission to delete this user");
            }

            // Check if user exists
            const existingUser = await db.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return notFoundResponse("user");
            }

            // Delete the user
            await db.user.delete({
                where: { id }
            });

            return successResponse(null, "User deleted successfully");
        } catch (error) {
            logger.error("Error deleting user", {
                error: error instanceof Error ? error.message : String(error),
                userId: params.id
            });

            return errorResponse(
                "Failed to delete user",
                undefined,
                { status: 500 }
            );
        }
    }
}

// Export a singleton instance
export const userController = new UserController(); 