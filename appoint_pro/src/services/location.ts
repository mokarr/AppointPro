'use server';

import { prisma } from '@/lib/prisma';

export interface Location {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export const getLocationById = async (locationId: string): Promise<Location | null> => {
    try {
        const location = await prisma.location.findUnique({
            where: { id: locationId },
        });
        return location;
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}; 