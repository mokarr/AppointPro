/**
 * Facility API Routes
 * 
 * This file defines the API routes for facility management.
 */

import { NextRequest } from "next/server";
import { facilityController } from "./controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { createFacilitySchema, facilityQuerySchema } from "./schema";

/**
 * GET /api/facilities
 * Get all facilities with optional filtering
 */
export function GET(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            facilityQuerySchema,
            (data, req: NextRequest) => facilityController.getAll(req),
            { type: 'query' }
        )
    )(request);
}

/**
 * POST /api/facilities
 * Create a new facility
 */
export function POST(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            createFacilitySchema,
            (data, req: NextRequest) => facilityController.create(req)
        )
    )(request);
}
