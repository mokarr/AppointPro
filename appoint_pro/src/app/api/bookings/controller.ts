/**
 * Bookings Controller
 * 
 * Controller for managing booking endpoints.
 */

import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/lib/api/base-controller";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    forbiddenResponse
} from "@/lib/api/response";
import { auth } from "@/lib/auth";

export class BookingController extends BaseController {
    constructor() {
        super({ resourceName: "booking" });
    }

    /**
     * Get all bookings with optional filtering
     */
    async getAll(request: NextRequest): Promise<NextResponse> {
        try {
            // Get the current user session
            const session = await auth();

            if (!session?.user) {
                return forbiddenResponse("Authentication required");
            }

            const url = new URL(request.url);

            // Pagination
            const page = parseInt(url.searchParams.get("page") || "1", 10);
            const limit = parseInt(url.searchParams.get("limit") || "10", 10);
            const skip = (page - 1) * limit;

            // Filters
            const userId = url.searchParams.get("userId");
            const facilityId = url.searchParams.get("facilityId");
            const locationId = url.searchParams.get("locationId");
            const status = url.searchParams.get("status");
            const from = url.searchParams.get("from");
            const to = url.searchParams.get("to");

            // Build filter object
            const where: any = {};

            // Regular users can only see their own bookings
            // Admins can see all bookings or filter by userId
            if (session.user.role !== "ADMIN") {
                where.userId = session.user.id;
            } else if (userId) {
                where.userId = userId;
            }

            if (facilityId) {
                where.facilityId = facilityId;
            }

            if (locationId) {
                where.locationId = locationId;
            }

            if (status) {
                where.status = status;
            }

            // Date range filter
            if (from || to) {
                where.startTime = {};

                if (from) {
                    where.startTime.gte = new Date(from);
                }

                if (to) {
                    where.startTime.lte = new Date(to);
                }
            }

            // Get bookings with pagination
            const [bookings, total] = await Promise.all([
                db.booking.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { startTime: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        facility: true,
                        location: true
                    }
                }),
                db.booking.count({ where })
            ]);

            // Calculate total pages
            const totalPages = Math.ceil(total / limit);

            return successResponse(
                bookings,
                "Bookings retrieved successfully",
                {
                    page,
                    limit,
                    total,
                    pages: totalPages
                }
            );
        } catch (error) {
            logger.error("Error retrieving bookings", {
                error: error instanceof Error ? error.message : String(error)
            });

            return errorResponse(
                "Failed to retrieve bookings",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Get a booking by ID
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            if (!session?.user) {
                return forbiddenResponse("Authentication required");
            }

            const booking = await db.booking.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    facility: true,
                    location: true
                }
            });

            if (!booking) {
                return notFoundResponse("booking");
            }

            // Regular users can only see their own bookings
            if (session.user.role !== "ADMIN" && booking.userId !== session.user.id) {
                return forbiddenResponse("You do not have permission to view this booking");
            }

            return successResponse(booking, "Booking retrieved successfully");
        } catch (error) {
            logger.error("Error retrieving booking", {
                error: error instanceof Error ? error.message : String(error),
                bookingId: params.id
            });

            return errorResponse(
                "Failed to retrieve booking",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Create a new booking
     */
    async create(request: NextRequest): Promise<NextResponse> {
        try {
            // Get the current user session
            const session = await auth();

            if (!session?.user) {
                return forbiddenResponse("Authentication required");
            }

            const data = await request.json();

            // Parse dates
            const startTime = new Date(data.startTime);
            const endTime = new Date(data.endTime);

            // Check if the facility exists
            const facility = await db.facility.findUnique({
                where: { id: data.facilityId }
            });

            if (!facility) {
                return errorResponse(
                    "The selected facility does not exist",
                    undefined,
                    { status: 400, code: "INVALID_FACILITY" }
                );
            }

            // Check if the location exists and is associated with the facility
            const location = await db.location.findFirst({
                where: {
                    id: data.locationId,
                    facilities: {
                        some: {
                            id: data.facilityId
                        }
                    }
                }
            });

            if (!location) {
                return errorResponse(
                    "The selected location does not exist or is not associated with the facility",
                    undefined,
                    { status: 400, code: "INVALID_LOCATION" }
                );
            }

            // Check for booking conflicts
            const conflictingBooking = await db.booking.findFirst({
                where: {
                    facilityId: data.facilityId,
                    status: { in: ["PENDING", "CONFIRMED"] },
                    OR: [
                        // New booking starts during an existing booking
                        {
                            startTime: { lte: startTime },
                            endTime: { gt: startTime }
                        },
                        // New booking ends during an existing booking
                        {
                            startTime: { lt: endTime },
                            endTime: { gte: endTime }
                        },
                        // New booking completely contains an existing booking
                        {
                            startTime: { gte: startTime },
                            endTime: { lte: endTime }
                        }
                    ]
                }
            });

            if (conflictingBooking) {
                return errorResponse(
                    "The selected time slot conflicts with an existing booking",
                    undefined,
                    { status: 409, code: "BOOKING_CONFLICT" }
                );
            }

            // Create the booking
            const booking = await db.booking.create({
                data: {
                    startTime,
                    endTime,
                    status: "PENDING",
                    userId: session.user.id,
                    facilityId: data.facilityId,
                    locationId: data.locationId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    facility: true,
                    location: true
                }
            });

            // Create notification for the user
            await db.notification.create({
                data: {
                    userId: session.user.id,
                    type: "BOOKING_CONFIRMATION",
                    title: "Booking Created",
                    content: `Your booking for ${facility.name} on ${startTime.toLocaleDateString()} has been created and is pending confirmation.`,
                    bookingId: booking.id
                }
            });

            return successResponse(
                booking,
                "Booking created successfully",
                undefined,
                { status: 201 }
            );
        } catch (error) {
            logger.error("Error creating booking", {
                error: error instanceof Error ? error.message : String(error)
            });

            return errorResponse(
                "Failed to create booking",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Update an existing booking
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            if (!session?.user) {
                return forbiddenResponse("Authentication required");
            }

            // Check if booking exists
            const existingBooking = await db.booking.findUnique({
                where: { id }
            });

            if (!existingBooking) {
                return notFoundResponse("booking");
            }

            // Regular users can only update their own bookings
            // And they can't change the status to CONFIRMED
            const data = await request.json();

            if (session.user.role !== "ADMIN") {
                if (existingBooking.userId !== session.user.id) {
                    return forbiddenResponse("You do not have permission to update this booking");
                }

                // Regular users can only cancel their bookings
                if (data.status && data.status !== "CANCELLED") {
                    return forbiddenResponse("You do not have permission to confirm or complete bookings");
                }
            }

            // Prepare update data
            const updateData: any = {};

            // Check for time changes and conflicts
            if (data.startTime || data.endTime) {
                const startTime = data.startTime ? new Date(data.startTime) : existingBooking.startTime;
                const endTime = data.endTime ? new Date(data.endTime) : existingBooking.endTime;

                // Validate time range
                if (startTime >= endTime) {
                    return errorResponse(
                        "End time must be after start time",
                        undefined,
                        { status: 400, code: "INVALID_TIME_RANGE" }
                    );
                }

                // Check for booking conflicts
                const conflictingBooking = await db.booking.findFirst({
                    where: {
                        id: { not: id }, // Exclude current booking
                        facilityId: existingBooking.facilityId,
                        status: { in: ["PENDING", "CONFIRMED"] },
                        OR: [
                            // New booking starts during an existing booking
                            {
                                startTime: { lte: startTime },
                                endTime: { gt: startTime }
                            },
                            // New booking ends during an existing booking
                            {
                                startTime: { lt: endTime },
                                endTime: { gte: endTime }
                            },
                            // New booking completely contains an existing booking
                            {
                                startTime: { gte: startTime },
                                endTime: { lte: endTime }
                            }
                        ]
                    }
                });

                if (conflictingBooking) {
                    return errorResponse(
                        "The selected time slot conflicts with an existing booking",
                        undefined,
                        { status: 409, code: "BOOKING_CONFLICT" }
                    );
                }

                if (data.startTime) updateData.startTime = startTime;
                if (data.endTime) updateData.endTime = endTime;
            }

            // Update status if provided
            if (data.status) {
                updateData.status = data.status;
            }

            // Update the booking
            const booking = await db.booking.update({
                where: { id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    facility: true,
                    location: true
                }
            });

            // Create notification for status changes
            if (data.status && data.status !== existingBooking.status) {
                await db.notification.create({
                    data: {
                        userId: booking.userId,
                        type: `BOOKING_${data.status}`,
                        title: `Booking ${data.status.charAt(0) + data.status.slice(1).toLowerCase()}`,
                        content: `Your booking for ${booking.facility.name} on ${booking.startTime.toLocaleDateString()} has been ${data.status.toLowerCase()}.`,
                        bookingId: booking.id
                    }
                });
            }

            return successResponse(booking, "Booking updated successfully");
        } catch (error) {
            logger.error("Error updating booking", {
                error: error instanceof Error ? error.message : String(error),
                bookingId: params.id
            });

            return errorResponse(
                "Failed to update booking",
                undefined,
                { status: 500 }
            );
        }
    }

    /**
     * Delete a booking
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Get the current user session
            const session = await auth();

            if (!session?.user) {
                return forbiddenResponse("Authentication required");
            }

            // Check if booking exists
            const existingBooking = await db.booking.findUnique({
                where: { id },
                include: {
                    facility: true
                }
            });

            if (!existingBooking) {
                return notFoundResponse("booking");
            }

            // Regular users can only delete their own pending bookings
            if (session.user.role !== "ADMIN") {
                if (existingBooking.userId !== session.user.id) {
                    return forbiddenResponse("You do not have permission to delete this booking");
                }

                if (existingBooking.status !== "PENDING") {
                    return forbiddenResponse("You can only delete pending bookings");
                }
            }

            // Create a notification before deleting the booking
            await db.notification.create({
                data: {
                    userId: existingBooking.userId,
                    type: "BOOKING_CANCELLED",
                    title: "Booking Deleted",
                    content: `Your booking for ${existingBooking.facility.name} on ${existingBooking.startTime.toLocaleDateString()} has been deleted.`
                }
            });

            // Delete the booking
            await db.booking.delete({
                where: { id }
            });

            return successResponse(null, "Booking deleted successfully");
        } catch (error) {
            logger.error("Error deleting booking", {
                error: error instanceof Error ? error.message : String(error),
                bookingId: params.id
            });

            return errorResponse(
                "Failed to delete booking",
                undefined,
                { status: 500 }
            );
        }
    }
}

// Export a singleton instance
export const bookingController = new BookingController(); 