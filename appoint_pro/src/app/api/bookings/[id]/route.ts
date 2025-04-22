/**
 * Booking API Routes for Specific Booking
 * 
 * This file defines the API routes for operating on a specific booking.
 */

import { NextRequest, NextResponse } from "next/server";
import { bookingController } from "../controller";
import { withApiMiddleware } from "@/lib/api/middleware";
import { withValidation } from "@/lib/api/validation";
import { updateBookingSchema } from "../schema";

// Helper function to handle route params
const withParams = (
    handler: (req: NextRequest, params: { id: string }) => Promise<NextResponse>,
    params: { id: string }
) => {
    return (req: NextRequest) => handler(req, params);
};

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
export function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(bookingController.getById.bind(bookingController), params)
    )(request);
}

/**
 * PATCH /api/bookings/:id
 * Update a specific booking
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
                    updateBookingSchema,
                    (data) => bookingController.update(req, p)
                )(req);
            },
            params
        )
    )(request);
}

/**
 * DELETE /api/bookings/:id
 * Delete a specific booking
 */
export function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withApiMiddleware(
        withParams(bookingController.delete.bind(bookingController), params)
    )(request);
} 