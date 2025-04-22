/**
 * User API Routes
 * 
 * This file defines the API routes for user management.
 */

import { NextRequest } from "next/server";
import { userController } from "./controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { createUserSchema, userQuerySchema } from "./schema";

/**
 * GET /api/users
 * Get all users with optional filtering (admin only)
 */
export function GET(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            userQuerySchema,
            (data, req: NextRequest) => userController.getAll(req),
            { type: 'query' }
        )
    )(request);
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export function POST(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            createUserSchema,
            (data, req: NextRequest) => userController.create(req)
        )
    )(request);
} 