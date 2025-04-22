/**
 * Facility API Validation Schemas
 * 
 * This file defines the validation schemas for facility API endpoints.
 */

import { z } from "zod";

/**
 * Schema for creating a new facility
 */
export const createFacilitySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
    description: z.string().min(1, "Description is required").max(1000, "Description cannot exceed 1000 characters"),
    price: z.number()
        .min(0, "Price cannot be negative")
        .refine(val => !isNaN(val), "Invalid price value"),
    locationId: z.string().uuid("Invalid location ID format"),
    features: z.array(z.string().uuid("Invalid feature ID format")).optional()
});

/**
 * Schema for updating an existing facility
 */
export const updateFacilitySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters").optional(),
    description: z.string().min(1, "Description is required").max(1000, "Description cannot exceed 1000 characters").optional(),
    price: z.number()
        .min(0, "Price cannot be negative")
        .refine(val => !isNaN(val), "Invalid price value")
        .optional(),
    locationId: z.string().uuid("Invalid location ID format").optional(),
    features: z.array(z.string().uuid("Invalid feature ID format")).optional()
});

/**
 * Schema for querying facilities
 */
export const facilityQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    locationId: z.string().optional(),
    name: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    features: z.union([
        z.string().transform(val => [val]),
        z.array(z.string())
    ]).optional(),
    organizationId: z.string().optional()
}); 