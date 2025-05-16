import { Metadata } from "next";
import { LocationDetailsContent } from "./LocationDetailsContent";
import { getFacilitiesByLocationId } from "@/services/facility";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LocationWithFacilities } from "@/models/location/locationWithFacilities";

export const metadata: Metadata = {
    title: "Locatie Details | AppointPro",
    description: "Bekijk en beheer de details van uw locatie",
};

async function getLocationWithFacilities(locationId: string): Promise<LocationWithFacilities> {
    const location = await prisma.location.findUnique({
        where: { id: locationId },
        include: {
            _count: {
                select: {
                    facilities: true
                }
            }
        }
    });

    if (!location) {
        notFound();
    }

    const facilities = await getFacilitiesByLocationId(locationId);

    return {
        id: location.id,
        name: location.name,
        address: location.address,
        postalCode: location.postalCode || undefined,
        country: location.country || undefined,
        facilitiesCount: location._count.facilities,
        facilities: facilities.map(facility => ({
            id: facility.id,
            name: facility.name,
            description: facility.description,
            price: facility.price,
            type: facility.type,
            locationId: facility.locationId,
            createdAt: facility.createdAt,
            updatedAt: facility.updatedAt
        }))
    };
}

export default async function LocationDetailsPage({
    params
}: {
    params: Promise<{ locationId: string }>
}) {
    const awaitParams = await params;
    const locationWithFacilities = await getLocationWithFacilities(awaitParams.locationId);

    return <LocationDetailsContent locationWithFacilities={locationWithFacilities} />;
}
