import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { BookingType } from '@prisma/client';

// Schema validation for booking creation
const bookingSchema = z.object({
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)),
    facilityId: z.string().optional(),
    classSessionId: z.string().optional(),
    locationId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
    userId: z.string().optional(),
    isClassBooking: z.boolean().default(false),
    personCount: z.number().optional(),
}).refine(data => {
    // Either facilityId or classSessionId must be provided
    return (data.isClassBooking && data.classSessionId) || (!data.isClassBooking && data.facilityId);
}, {
    message: "Either facilityId or classSessionId must be provided based on booking type",
    path: ["facilityId"]
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = bookingSchema.parse(body);
        let booking;
        
        // if the person count is not provided or is less than 1, we need to return an error
        if(!validatedData.personCount || validatedData.personCount < 1)
        {
            return NextResponse.json({
                success: false,
                error: 'Person count must be at least 1'
            }, { status: 400 });
        }

        // If this is a class booking, we need to get the classSessionId
        if (validatedData.isClassBooking && validatedData.classSessionId) {
            // First verify that the class session exists
            const classSession = await prisma.classSession.findUnique({
                where: {
                    id: validatedData.classSessionId
                }
            });

            if (!classSession) {
                return NextResponse.json({
                    success: false,
                    error: 'Class session not found'
                }, { status: 404 });
            }
        }

        // Check if there's a userId provided (user booking) or not (guest booking)
        if (validatedData.userId) {
            // Create booking with user connection
            booking = await prisma.booking.create({
                data: {
                    startTime: validatedData.startTime,
                    endTime: validatedData.endTime,
                    ...(validatedData.isClassBooking ? {
                        classSessionId: validatedData.classSessionId,
                    } : {
                        facilityId: validatedData.facilityId,
                    }),
                    locationId: validatedData.locationId,
                    customerName: validatedData.customerName,
                    customerEmail: validatedData.customerEmail,
                    customerPhone: validatedData.customerPhone,
                    notes: validatedData.notes,
                    status: 'CONFIRMED',
                    userId: validatedData.userId,
                    type: validatedData.isClassBooking ? BookingType.CLASS_SESSION : BookingType.NORMAL,
                    personCount: validatedData.personCount
                },
            });
        } else {
            // Create booking without user connection for guest bookings
            booking = await prisma.booking.create({
                data: {
                    startTime: validatedData.startTime,
                    endTime: validatedData.endTime,
                    ...(validatedData.isClassBooking ? {
                        classSessionId: validatedData.classSessionId,
                    } : {
                        facilityId: validatedData.facilityId,
                    }),
                    locationId: validatedData.locationId,
                    customerName: validatedData.customerName,
                    customerEmail: validatedData.customerEmail,
                    customerPhone: validatedData.customerPhone,
                    notes: validatedData.notes,
                    status: 'CONFIRMED',
                    type: validatedData.isClassBooking ? 'CLASSES' : 'NORMAL',
                    personCount: validatedData.personCount
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: booking
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create booking'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const facilityId = searchParams.get('facilityId');
        const locationId = searchParams.get('locationId');
        const classSessionId = searchParams.get('classSessionId');

        const whereClause = {
            ...(facilityId ? { facilityId } : {}),
            ...(locationId ? { locationId } : {}),
            ...(classSessionId ? { classSessionId } : {}),
        };

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            orderBy: {
                startTime: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch bookings'
        }, { status: 500 });
    }
} 