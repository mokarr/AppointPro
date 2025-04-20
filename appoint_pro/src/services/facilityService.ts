import { prisma } from "../lib/prisma";

const createFacility = async (locationId: string, name: string) => {
    // Zoek de locatie op basis van de locatieId
    const location = await prisma.location.findUnique({
        where: { id: locationId },
    });

    if (!location) {
        throw new Error("Locatie bestaat niet");
    }

    // Maak de nieuwe faciliteit aan
    const facility = await prisma.facility.create({
        data: {
            name: name,
            locationId: location.id,
        },
    });

    return facility;
};

export { createFacility };
