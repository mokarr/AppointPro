'use server';

import { executeAction } from "../lib/executeAction";
import { prisma } from "../lib/prisma";

export interface Facility {
    id: string;
    name: string;
    description: string;
    price: number | null;
    locationId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Haal faciliteiten op voor een specifieke locatie
 */
export const getFacilitiesByLocationId = async (locationId: string): Promise<Facility[]> => {
    return executeAction({
        actionFn: async () => {
            const facilities = await prisma.facility.findMany({
                where: { locationId },
                orderBy: { name: 'asc' },
            });

            return facilities;
        },
        successMessage: "Faciliteiten opgehaald",
    });
};

/**
 * Haal een specifieke faciliteit op op basis van ID
 */
export const getFacilityById = async (facilityId: string): Promise<Facility | null> => {
    try {
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId }
        });
        return facility;
    } catch (error) {
        console.error("Error fetching facility:", error);
        return null;
    }
};

/**
 * Maak een nieuwe faciliteit aan
 */
export const createFacility = async (
    facilityData: { name: string; description: string; price?: number; locationId: string }
) => {
    return executeAction({
        actionFn: async () => {
            const { name, description, price, locationId } = facilityData;

            // Controleer of de locatie bestaat
            const location = await prisma.location.findUnique({
                where: { id: locationId }
            });

            if (!location) {
                throw new Error("Locatie bestaat niet");
            }

            const facility = await prisma.facility.create({
                data: {
                    name,
                    description,
                    price: price || null,
                    locationId
                }
            });

            return facility;
        },
        successMessage: "Faciliteit aangemaakt",
    });
};

/**
 * Update een faciliteit
 */
export const updateFacility = async (
    facilityId: string,
    facilityData: { name?: string; description?: string; price?: number | null }
) => {
    return executeAction({
        actionFn: async () => {
            const facility = await prisma.facility.update({
                where: { id: facilityId },
                data: facilityData
            });

            if (!facility) {
                throw new Error("Faciliteit bestaat niet");
            }

            return facility;
        },
        successMessage: "Faciliteit bijgewerkt",
    });
};

/**
 * Verwijder een faciliteit
 */
export const deleteFacility = async (facilityId: string) => {
    return executeAction({
        actionFn: async () => {
            const facility = await prisma.facility.delete({
                where: { id: facilityId }
            });

            return facility;
        },
        successMessage: "Faciliteit verwijderd",
    });
}; 