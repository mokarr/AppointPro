import { prisma } from '@/lib/prisma';

export async function getClassById(classId: string) {
    try {
        const classData = await prisma.class.findUnique({
            where: {
                id: classId,
            },
        });

        return classData;
    } catch (error) {
        console.error('Error fetching class:', error);
        return null;
    }
}

export async function getClassesByLocationId(locationId: string) {
    try {
        const classes = await prisma.class.findMany({
            where: {
                locationId: locationId,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return classes;
    } catch (error) {
        console.error('Error fetching classes:', error);
        return [];
    }
} 