import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for cancel conflicts request
const cancelConflictsSchema = z.object({
    bookingIds: z.array(z.string())
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = cancelConflictsSchema.parse(body);

        // Update all bookings to cancelled status
        const updatedBookings = await prisma.booking.updateMany({
            where: {
                id: {
                    in: validatedData.bookingIds
                }
            },
            data: {
                status: 'CANCELLED'
            }
        });

        return NextResponse.json({
            status: 'success',
            message: 'Conflicting bookings have been cancelled',
            cancelledCount: updatedBookings.count
        });

    } catch (error) {
        console.error('Error cancelling conflicting bookings:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                status: 'error',
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'error',
            error: 'Failed to cancel conflicting bookings'
        }, { status: 500 });
    }
} 