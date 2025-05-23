'use server';

import { prisma } from '@/lib/prisma';
import LocationWithSettings from '@/models/Settings/LocationWithSettings';
import LocationSettings from '@/models/Settings/SettingModels/LocationSettings';
import { Location } from '@prisma/client';


export const getLocationById = async (locationId: string): Promise<LocationWithSettings> => {
        const location = await prisma.location.findUnique({
            where: { id: locationId },
        include: {
            LocationSettings: {
                select: {
                    data: true
                }
            }
        }
        });

        if (!location) throw new Error('Location not found');

        return location as LocationWithSettings;
}; 