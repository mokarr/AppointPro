'use server';

import { executeAction } from "@/lib/executeAction";
import { prisma } from "@/lib/prisma";
import { Facility, FacilityType } from "@prisma/client";
import FacilityWithSettings from "@/models/Settings/FacilityWithSettings";
/**
 * Haal faciliteiten op voor een specifieke locatie
 */
export const getFacilitiesByLocationId = async (locationId: string): Promise<Facility[]> => {
    const response = await executeAction({
        actionFn: async () => {
            const facilities = await prisma.facility.findMany({
                where: { locationId },
                orderBy: { name: 'asc' },
            });

            return facilities;
        },
        successMessage: "Faciliteiten opgehaald",
    });

    return response.data || [];
};

/**
 * Haal een specifieke faciliteit op op basis van ID
 */
export const getFacilityById = async (facilityId: string): Promise<FacilityWithSettings> => {
    try {
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId },
            include: {
                FacilitySettings: {
                    select: {
                        data: true
                    }
                },
            },
        });

        if (!facility) {
            throw new Error("Faciliteit bestaat niet");
        }

        return facility as FacilityWithSettings;
    } catch (error) {
        console.error("Error fetching facility:", error);
        throw error;
    }
};

/**
 * Maak een nieuwe faciliteit aan
 */
export const createFacility = async (
    facilityData: { name: string; description: string; price?: number | null; locationId: string }
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

            // Type assertion is used here to avoid Prisma type issues
            // while still providing type safety in our code
            const facility = await prisma.facility.create({
                data: {
                    name,
                    description,
                    price: price ?? null,
                    locationId
                } as any // Using as any only for bypassing Prisma's type limitation
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
            // Type assertion is used here to avoid Prisma type issues
            // while still providing type safety in our code
            const facility = await prisma.facility.update({
                where: { id: facilityId },
                data: facilityData as any // Using as any only for bypassing Prisma's type limitation
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

export const updateFacilityType = async (facilityId: string, type: FacilityType) => {
    return executeAction({
        actionFn: async () => {
            const facility = await prisma.facility.update({
                where: { id: facilityId },
                data: { type }
            });
            return facility;
        },
        successMessage: "Faciliteit bijgewerkt",
    });
}; 

