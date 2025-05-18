import { FacilitiesPageContent } from "./FacilitiesPageContent"
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Faciliteiten | AppointPro",
    description: "Beheer al uw sportfaciliteiten",
}

async function getLocationsWithFacilities() {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/sign-in");
    }

    try {
        // First get the user's organization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                organization: true
            }
        });

        if (!user?.organization) {
            throw new Error("No organization found for user");
        }

        // Then get locations for that organization
        const locations = await prisma.location.findMany({
            where: {
                organizationId: user.organization.id
            },
            include: {
                facilities: {
                    orderBy: {
                        name: 'asc'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return locations;
    } catch (error) {
        console.error('Error fetching locations with facilities:', error);
        return [];
    }
}

export default async function FacilitiesPage() {
    const locationsWithFacilities = await getLocationsWithFacilities();
    
    return <FacilitiesPageContent initialLocations={locationsWithFacilities} />;
}
