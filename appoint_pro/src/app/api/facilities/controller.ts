/**
 * Facilities Controller
 * 
 * Controller for managing facilities endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/lib/api/base-controller";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import { successResponse, errorResponse, notFoundResponse } from "@/lib/api/response";

export class FacilityController extends BaseController {
    constructor() {
        super({ resourceName: "facility" });
    }

    /**
     * Get all facilities with optional filtering
     */
    async getAll(request: NextRequest): Promise<NextResponse> {
        try {
            const url = new URL(request.url);

            // Pagination
            const page = parseInt(url.searchParams.get("page") || "1", 10);
            const limit = parseInt(url.searchParams.get("limit") || "10", 10);
            const skip = (page - 1) * limit;

            // Filters
            const locationId = url.searchParams.get("locationId");
            const name = url.searchParams.get("name");

            // Build filter object
            const where: any = {};

            if (locationId) {
                where.locationId = locationId;
            }

            if (name) {
                where.name = {
                    contains: name,
                    mode: 'insensitive'
                };
            }

            // Get facilities with pagination
            const [facilities, total] = await Promise.all([
                db.facility.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                    include: {
                        location: true,
                        features: true
                    }
                }),
                db.facility.count({ where })
            ]);

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            return successResponse(
                facilities,
                "Facilities retrieved successfully",
                {
                    page,
                    limit,
                    total,
                    pages: totalPages
                }
            );
        } catch (error) {
            logger.error("Error retrieving facilities", {
                error: error instanceof Error ? error.message : String(error)
            });

            return errorResponse(
                "Failed to retrieve facilities",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Get a facility by ID
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            const facility = await db.facility.findUnique({
                where: { id },
                include: {
                    location: true,
                    features: true,
                    bookings: {
                        where: {
                            startTime: {
                                gte: new Date()
                            }
                        },
                        orderBy: {
                            startTime: 'asc'
                        },
                        take: 10
                    }
                }
            });

            if (!facility) {
                return notFoundResponse("facility");
            }

            return successResponse(facility, "Facility retrieved successfully");
        } catch (error) {
            logger.error("Error retrieving facility", {
                error: error instanceof Error ? error.message : String(error),
                facilityId: params.id
            });

            return errorResponse(
                "Failed to retrieve facility",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Create a new facility
     */
    async create(request: NextRequest): Promise<NextResponse> {
        try {
            const data = await request.json();

            // Create the facility
            const facility = await db.facility.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    locationId: data.locationId,
                    // If features are provided, connect them
                    ...(data.features && {
                        features: {
                            connect: data.features.map((featureId: string) => ({ id: featureId }))
                        }
                    })
                },
                include: {
                    location: true,
                    features: true
                }
            });

            return successResponse(
                facility,
                "Facility created successfully",
                undefined,
                { status: 201 }
            );
        } catch (error) {
            logger.error("Error creating facility", {
                error: error instanceof Error ? error.message : String(error)
            });

            return errorResponse(
                "Failed to create facility",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Update an existing facility
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;
            const data = await request.json();

            // Check if facility exists
            const existingFacility = await db.facility.findUnique({
                where: { id }
            });

            if (!existingFacility) {
                return notFoundResponse("facility");
            }

            // Update the facility
            const facility = await db.facility.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.price !== undefined && { price: data.price }),
                    ...(data.locationId !== undefined && { locationId: data.locationId }),
                    // If features are provided, update the connections
                    ...(data.features && {
                        features: {
                            set: data.features.map((featureId: string) => ({ id: featureId }))
                        }
                    })
                },
                include: {
                    location: true,
                    features: true
                }
            });

            return successResponse(facility, "Facility updated successfully");
        } catch (error) {
            logger.error("Error updating facility", {
                error: error instanceof Error ? error.message : String(error),
                facilityId: params.id
            });

            return errorResponse(
                "Failed to update facility",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Delete a facility
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Check if facility exists
            const existingFacility = await db.facility.findUnique({
                where: { id }
            });

            if (!existingFacility) {
                return notFoundResponse("facility");
            }

            // Check if facility has bookings
            const bookingsCount = await db.booking.count({
                where: { facilityId: id }
            });

            if (bookingsCount > 0) {
                return errorResponse(
                    "Cannot delete facility with existing bookings",
                    undefined,
                    { status: 400, code: "FACILITY_HAS_BOOKINGS" }
                );
            }

            // Delete the facility
            await db.facility.delete({
                where: { id }
            });

            return successResponse(null, "Facility deleted successfully");
        } catch (error) {
            logger.error("Error deleting facility", {
                error: error instanceof Error ? error.message : String(error),
                facilityId: params.id
            });

            return errorResponse(
                "Failed to delete facility",
                undefined,
                { status: 500 }
            );
        }
    }
}

// Export a singleton instance
export const facilityController = new FacilityController(); 