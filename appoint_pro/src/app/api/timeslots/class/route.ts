import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ClassSessionSettings {
    maxParticipants?: number;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    if (!classId || !date) {
        return NextResponse.json({ error: 'Class ID and date are required' }, { status: 400 });
    }

    try {
        // Parse the date and create start and end of day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Get all sessions for this class on the specified date
        const sessions = await prisma.classSession.findMany({
            where: {
                classId: classId,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                bookings: true,
                ClassSessionSettings: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        // Transform sessions into time slots
        const timeSlots = sessions.map(session => {
            // Get maxParticipants from settings or use a default value
            const settings = session.ClassSessionSettings?.data as ClassSessionSettings | undefined;
            const maxParticipants = settings?.maxParticipants || 999;
            const currentParticipants = session.bookings.length;

            return {
                startTime: session.startTime.toTimeString().slice(0, 5), // HH:mm format
                endTime: session.endTime.toTimeString().slice(0, 5), // HH:mm format
                isAvailable: currentParticipants < maxParticipants,
                classSessionId: session.id // Add the classSessionId to the response
            };
        });

        return NextResponse.json(timeSlots);
    } catch (error) {
        console.error('Error fetching class time slots:', error);
        return NextResponse.json({ error: 'Failed to fetch class time slots' }, { status: 500 });
    }
} 