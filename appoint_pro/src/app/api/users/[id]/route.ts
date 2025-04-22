/**
 * User API Routes for Specific User
 * 
 * This file defines the API routes for operating on a specific user.
 */

import { NextRequest, NextResponse } from "next/server";
import { userController } from "../controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { updateUserSchema } from "../schema";

// Helper function to handle route params
const withParams = (
    handler: (req: NextRequest, params: { id: string }) => Promise<NextResponse>,
    params: { id: string }
) => {
    return (req: NextRequest) => handler(req, params);
};

/**
 * GET /api/users/:id
 * Get a specific user by ID
 */
export function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(userController.getById.bind(userController), params)
    )(request);
}

/**
 * PATCH /api/users/:id
 * Update a specific user
 */
export function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(
            async (req, p) => {
                // Using validation inline here since we need to pass params
                return withValidation(
                    updateUserSchema,
                    (data) => userController.update(req, p)
                )(req);
            },
            params
        )
    )(request);
}

/**
 * DELETE /api/users/:id
 * Delete a specific user
 */
export function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(userController.delete.bind(userController), params)
    )(request);
} 