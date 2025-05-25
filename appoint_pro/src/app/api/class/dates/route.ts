import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
        return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    try {
        // Get all sessions for this class
        const sessions = await prisma.classSession.findMany({
            where: {
                classId: classId,
                startTime: {
                    gte: new Date(), // Only future sessions
                },
            },
            select: {
                startTime: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        // Extract unique dates from sessions
        const availableDates = sessions.map(session => {
            const date = new Date(session.startTime);
            return date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        });

        // Remove duplicates
        const uniqueDates = [...new Set(availableDates)];

        return NextResponse.json(uniqueDates);
    } catch (error) {
        console.error('Error fetching class dates:', error);
        return NextResponse.json({ error: 'Failed to fetch class dates' }, { status: 500 });
    }
} 