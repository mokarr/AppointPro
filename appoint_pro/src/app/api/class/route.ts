import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation for class creation
const createClassSchema = z.object({
    name: z.string(),
    description: z.string(),
    instructor: z.string(),
    maxParticipants: z.number(),
    locationId: z.string(),
    facilityId: z.string().optional(),
    startTime: z.string(),
    duration: z.number(),
    sessions: z.array(z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string()
    }))
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createClassSchema.parse(body);

        // Create the class and its sessions in a transaction
        const result = await prisma.$transaction(
            async (tx) => {
                // Create the class
                const newClass = await tx.class.create({
                    data: {
                        name: validatedData.name,
                        description: validatedData.description,
                        instructor: validatedData.instructor,
                        locationId: validatedData.locationId,
                        facilityId: validatedData.facilityId
                    }
                });

                // Create class sessions and their associated bookings
                const sessions = await Promise.all(
                    validatedData.sessions.map(async (session) => {
                        // Create the class session
                        const classSession = await tx.classSession.create({
                            data: {
                                classId: newClass.id,
                                startTime: new Date(`${session.date}T${session.startTime}`),
                                endTime: new Date(`${session.date}T${session.endTime}`)
                            }
                        });

                        // If a facility is selected, create a booking for the session
                        if (validatedData.facilityId) {
                            await tx.booking.create({
                                data: {
                                    startTime: new Date(`${session.date}T${session.startTime}`),
                                    endTime: new Date(`${session.date}T${session.endTime}`),
                                    facilityId: validatedData.facilityId,
                                    locationId: validatedData.locationId,
                                    classSessionId: classSession.id,
                                    status: 'CONFIRMED',
                                    type: 'CLASSES',
                                    customerName: validatedData.instructor
                                }
                            });
                        }

                        return classSession;
                    })
                );

                return {
                    class: newClass,
                    sessions
                };
            },
            {
                timeout: 30000 // 30 seconds timeout because of the large number of sessions
            }
        );

        return NextResponse.json({
            status: 'success',
            message: 'Class and sessions created successfully',
            data: result
        });

    } catch (error) {
        console.error('Error creating class:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                status: 'error',
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'error',
            error: 'Failed to create class'
        }, { status: 500 });
    }
}
