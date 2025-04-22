/**
 * User API Validation Schemas
 * 
 * This file defines the validation schemas for user API endpoints.
 */

import { z } from "zod";

// Valid user roles
const userRoles = ["ADMIN", "OWNER", "STAFF", "CLIENT"] as const;

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    role: z.enum(userRoles).default("CLIENT"),
    organizationId: z.string().uuid("Invalid organization ID format").optional()
});

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .optional(),
    role: z.enum(userRoles).optional(),
    organizationId: z.string().uuid("Invalid organization ID format").optional().nullable()
});

/**
 * Schema for querying users
 */
export const userQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    email: z.string().optional(),
    name: z.string().optional(),
    role: z.enum(userRoles).optional(),
    organizationId: z.string().optional()
}); 