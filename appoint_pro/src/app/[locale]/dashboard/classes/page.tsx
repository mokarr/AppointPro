import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClassesPageContent } from "./ClassesPageContent";

async function getLocationsWithClasses() { //TODO: refactor to one function to use this also in classes page
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
                classes: {
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


export default async function ClassesPage() {
    const locationsWithClasses = await getLocationsWithClasses();
    
    return <ClassesPageContent initialLocations={locationsWithClasses} />;
}
