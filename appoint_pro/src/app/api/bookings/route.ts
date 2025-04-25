import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for booking creation
const bookingSchema = z.object({
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)),
    facilityId: z.string(),
    locationId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
    userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = bookingSchema.parse(body);
        let booking;

        // Check if there's a userId provided (user booking) or not (guest booking)
        if (validatedData.userId) {
            // Create booking with user connection
            booking = await prisma.booking.create({
                data: {
                    startTime: validatedData.startTime,
                    endTime: validatedData.endTime,
                    facilityId: validatedData.facilityId,
                    locationId: validatedData.locationId,
                    customerName: validatedData.customerName,
                    customerEmail: validatedData.customerEmail,
                    customerPhone: validatedData.customerPhone,
                    notes: validatedData.notes,
                    status: 'CONFIRMED',
                    user: {
                        connect: {
                            id: validatedData.userId
                        }
                    }
                },
            });
        } else {
            // Create booking without user connection for guest bookings
            booking = await prisma.booking.create({
                data: {
                    startTime: validatedData.startTime,
                    endTime: validatedData.endTime,
                    facilityId: validatedData.facilityId,
                    locationId: validatedData.locationId,
                    customerName: validatedData.customerName,
                    customerEmail: validatedData.customerEmail,
                    customerPhone: validatedData.customerPhone,
                    notes: validatedData.notes,
                    status: 'CONFIRMED',
                    // No user field specified for guest bookings
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

        const whereClause = {
            ...(facilityId ? { facilityId } : {}),
            ...(locationId ? { locationId } : {}),
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