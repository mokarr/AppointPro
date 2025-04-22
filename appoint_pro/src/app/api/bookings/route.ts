/**
 * Booking API Routes
 * 
 * This file defines the API routes for booking management.
 */

import { NextRequest } from "next/server";
import { bookingController } from "./controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { createBookingSchema, bookingQuerySchema } from "./schema";

/**
 * GET /api/bookings
 * Get all bookings with optional filtering
 */
export function GET(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            bookingQuerySchema,
            (data, req: NextRequest) => bookingController.getAll(req),
            { type: 'query' }
        )
    )(request);
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export function POST(request: NextRequest) {
    return withApiMiddleware(
        withValidation(
            createBookingSchema,
            (data, req: NextRequest) => bookingController.create(req)
        )
    )(request);
} 