import { prisma } from '@/lib/prisma';

export interface BookingCreateInput {
    startTime: Date;
    endTime: Date;
    facilityId: string;
    locationId: string;
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
}

export interface BookingResponse {
    id: string;
    startTime: Date;
    endTime: Date;
    facilityId: string;
    locationId: string;
    status: string;
    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;
    notes?: string | null;
    createdAt: Date;
}

export async function createBooking(data: BookingCreateInput): Promise<BookingResponse> {
    try {
        const booking = await prisma.booking.create({
            data: {
                startTime: data.startTime,
                endTime: data.endTime,
                facilityId: data.facilityId,
                locationId: data.locationId,
                userId: data.userId,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                notes: data.notes,
                status: 'CONFIRMED', // By default, set status to CONFIRMED
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                facilityId: true,
                locationId: true,
                status: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                notes: true,
                createdAt: true,
            },
        });

        return booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking');
    }
}

export async function getBookingById(id: string): Promise<BookingResponse | null> {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                facilityId: true,
                locationId: true,
                status: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                notes: true,
                createdAt: true,
            },
        });

        return booking;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw new Error('Failed to fetch booking');
    }
}

export async function getBookingsByFacility(facilityId: string): Promise<BookingResponse[]> {
    try {
        const bookings = await prisma.booking.findMany({
            where: { facilityId },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                facilityId: true,
                locationId: true,
                status: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                notes: true,
                createdAt: true,
            },
        });

        return bookings;
    } catch (error) {
        console.error('Error fetching bookings by facility:', error);
        throw new Error('Failed to fetch bookings');
    }
} 