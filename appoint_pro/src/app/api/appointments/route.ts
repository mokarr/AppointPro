import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

// Schema validation for appointment creation
const appointmentSchema = z.object({
    title: z.string(),
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)),
    facilityId: z.string(),
    locationId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['CONFIRMED', 'CANCELLED', 'PENDING']).default('CONFIRMED'),
    userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate the request body
        const validatedData = appointmentSchema.parse(body);

        const appointment = await prisma.booking.create({
            data: {
                startTime: validatedData.startTime,
                endTime: validatedData.endTime,
                facilityId: validatedData.facilityId,
                locationId: validatedData.locationId,
                customerName: validatedData.customerName,
                customerEmail: validatedData.customerEmail,
                customerPhone: validatedData.customerPhone,
                notes: validatedData.notes,
                status: validatedData.status,
                userId: validatedData.userId || session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            data: appointment
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating appointment:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create appointment'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const facilityId = searchParams.get('facilityId');
        const locationId = searchParams.get('locationId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const organizationId = searchParams.get('organizationId');

        // Define a type for the where clause
        type WhereClause = {
            facilityId?: string;
            locationId?: string;
            location?: {
                organizationId: string;
            };
            startTime?: {
                gte?: Date;
                lte?: Date;
            };
            endTime?: {
                lte?: Date;
            };
        };

        const whereClause: WhereClause = {
            ...(facilityId ? { facilityId } : {}),
            ...(locationId ? { locationId } : {}),
            ...(organizationId ? {
                location: {
                    organizationId
                }
            } : {}),
        };

        // Add date range filter if provided
        if (startDate && endDate) {
            whereClause.startTime = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        } else if (startDate) {
            whereClause.startTime = {
                gte: new Date(startDate)
            };
        } else if (endDate) {
            whereClause.endTime = {
                lte: new Date(endDate)
            };
        }

        const appointments = await prisma.booking.findMany({
            where: whereClause,
            orderBy: {
                startTime: 'asc',
            },
            include: {
                facility: true,
                location: true,
            }
        });

        return NextResponse.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch appointments'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Appointment ID is required'
            }, { status: 400 });
        }

        // Validate the update data
        const validatedData = appointmentSchema.partial().parse(updateData);

        const appointment = await prisma.booking.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to update appointment'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Appointment ID is required'
            }, { status: 400 });
        }

        await prisma.booking.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete appointment'
        }, { status: 500 });
    }
} 