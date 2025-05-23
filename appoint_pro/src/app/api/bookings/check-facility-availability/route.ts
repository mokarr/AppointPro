import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for availability check
const availabilityCheckSchema = z.object({
    facilityId: z.string(),
    sessions: z.array(z.object({
        startTime: z.string().transform(str => new Date(str)),
        endTime: z.string().transform(str => new Date(str))
    }))
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = availabilityCheckSchema.parse(body);

        // Find all bookings that overlap with any of the sessions
        const conflictingBookings = await prisma.booking.findMany({
            where: {
                facilityId: validatedData.facilityId,
                OR: validatedData.sessions.map(session => ({
                    AND: [
                        {
                            startTime: {
                                lt: session.endTime // Booking starts before session ends
                            }
                        },
                        {
                            endTime: {
                                gt: session.startTime // Booking ends after session starts
                            }
                        }
                    ]
                }))
            },
            include: {
                facility: true,
                classSession: {
                    include: {
                        class: true
                    }
                }
            }
        });

        if (conflictingBookings.length > 0) {
            // Separate regular bookings from class bookings
            const regularConflicts = conflictingBookings
                .filter(booking => booking.type === 'NORMAL')
                .map(booking => ({
                    id: booking.id,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    facilityName: booking.facility!.name,   
                    customerName: booking.customerName
                }));

            const classConflicts = conflictingBookings
                .filter(booking => booking.type === 'CLASSES')
                .map(booking => ({
                    id: booking.id,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    facilityName: booking.facility!.name,
                    className: booking.classSession?.class.name,
                    instructor: booking.classSession?.class.instructor
                }));

            return NextResponse.json({
                conflictStatus: regularConflicts.length > 0,
                classConflictsStatus: classConflicts.length > 0,
                conflicts: regularConflicts,
                classConflicts: classConflicts
            });
        }

        return NextResponse.json({
            conflictStatus: false,
            classConflictsStatus: false
        });

    } catch (error) {
        console.error('Error checking facility availability:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                status: 'error',
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'error',
            error: 'Failed to check facility availability'
        }, { status: 500 });
    }
} 