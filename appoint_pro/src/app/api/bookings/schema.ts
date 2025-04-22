/**
 * Booking API Validation Schemas
 * 
 * This file defines the validation schemas for booking API endpoints.
 */

import { z } from "zod";

// Valid booking statuses
const bookingStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

/**
 * Schema for creating a new booking
 */
export const createBookingSchema = z.object({
    startTime: z.string().datetime("Invalid start time format. ISO 8601 format required"),
    endTime: z.string().datetime("Invalid end time format. ISO 8601 format required"),
    facilityId: z.string().uuid("Invalid facility ID format"),
    locationId: z.string().uuid("Invalid location ID format"),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
})
    .refine(
        data => new Date(data.startTime) < new Date(data.endTime),
        {
            message: "End time must be after start time",
            path: ["endTime"]
        }
    );

/**
 * Schema for updating an existing booking
 */
export const updateBookingSchema = z.object({
    startTime: z.string().datetime("Invalid start time format. ISO 8601 format required").optional(),
    endTime: z.string().datetime("Invalid end time format. ISO 8601 format required").optional(),
    status: z.enum(bookingStatuses).optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
})
    .refine(
        data => !data.startTime || !data.endTime || new Date(data.startTime) < new Date(data.endTime),
        {
            message: "End time must be after start time",
            path: ["endTime"]
        }
    );

/**
 * Schema for querying bookings
 */
export const bookingQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    userId: z.string().uuid("Invalid user ID format").optional(),
    facilityId: z.string().uuid("Invalid facility ID format").optional(),
    locationId: z.string().uuid("Invalid location ID format").optional(),
    status: z.enum(bookingStatuses).optional(),
    from: z.string().datetime("Invalid from date format. ISO 8601 format required").optional(),
    to: z.string().datetime("Invalid to date format. ISO 8601 format required").optional(),
})
    .refine(
        data => !data.from || !data.to || new Date(data.from) < new Date(data.to),
        {
            message: "To date must be after from date",
            path: ["to"]
        }
    ); 