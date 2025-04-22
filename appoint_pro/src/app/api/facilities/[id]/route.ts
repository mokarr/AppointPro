/**
 * Facility API Routes for Specific Facility
 * 
 * This file defines the API routes for operating on a specific facility.
 */

import { NextRequest, NextResponse } from "next/server";
import { facilityController } from "../controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { updateFacilitySchema } from "../schema";

// Helper function to handle route params
const withParams = (
    handler: (req: NextRequest, params: { id: string }) => Promise<NextResponse>,
    params: { id: string }
) => {
    return (req: NextRequest) => handler(req, params);
};

/**
 * GET /api/facilities/:id
 * Get a specific facility by ID
 */
export function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(facilityController.getById.bind(facilityController), params)
    )(request);
}

/**
 * PATCH /api/facilities/:id
 * Update a specific facility
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
                    updateFacilitySchema,
                    (data) => facilityController.update(req, p)
                )(req);
            },
            params
        )
    )(request);
}

/**
 * DELETE /api/facilities/:id
 * Delete a specific facility
 */
export function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(facilityController.delete.bind(facilityController), params)
    )(request);
} 