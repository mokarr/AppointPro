import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        // Get the authenticated user
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Niet geautoriseerd" },
                { status: 401 }
            )
        }


        // Get organization directly from session or fetch from DB
        let organizationId: string | null = null;

        // Try getting organizationId from the session
        if (session.user.organizationId) {
            organizationId = session.user.organizationId as string;
        }
        // If not found in session, try to get from the database
        else {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { organizationId: true },
            });
            organizationId = dbUser?.organizationId || null;
        }

        // If we still don't have an organization, use test-org as fallback
        if (!organizationId) {
            // Check if test-org exists as a fallback
            const testOrg = await prisma.organization.findUnique({
                where: { id: 'test-org' }
            });

            if (testOrg) {
                organizationId = 'test-org';

                // Update user's organization if possible
                if (session.user.id) {
                    await prisma.user.update({
                        where: { id: session.user.id },
                        data: { organizationId: 'test-org' }
                    }).catch(err => console.log('Failed to update user organization:', err));
                }
            } else {
                return NextResponse.json(
                    { error: "Geen organisatie gevonden" },
                    { status: 400 }
                );
            }
        }

        // Fetch locations for the user's organization
        const locations = await prisma.location.findMany({
            where: {
                organizationId
            },
            include: {
                _count: {
                    select: {
                        facilities: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        // Transform the data to include facilityCount
        const formattedLocations = locations.map(location => ({
            ...location,
            facilitiesCount: location._count.facilities,
        }));

        return NextResponse.json(formattedLocations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het ophalen van de locaties" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get the authenticated user
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Niet geautoriseerd" },
                { status: 401 }
            )
        }

        // Get organization directly from session or fetch from DB
        let organizationId: string | null = null;

        // Try getting organizationId from the session
        if (session.user.organizationId) {
            organizationId = session.user.organizationId as string;
        }
        // If not found in session, try to get from the database
        else {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { organizationId: true },
            });
            organizationId = dbUser?.organizationId || null;
        }

        // If we still don't have an organization, use test-org as fallback
        if (!organizationId) {
            // Check if test-org exists as a fallback
            const testOrg = await prisma.organization.findUnique({
                where: { id: 'test-org' }
            });

            if (testOrg) {
                organizationId = 'test-org';

                // Update user's organization if possible
                if (session.user.id) {
                    await prisma.user.update({
                        where: { id: session.user.id },
                        data: { organizationId: 'test-org' }
                    }).catch(err => console.log('Failed to update user organization:', err));
                }
            } else {
                return NextResponse.json(
                    { error: "Geen organisatie gevonden" },
                    { status: 400 }
                );
            }
        }

        // Parse the request body
        const { name, address, postalCode, country } = await request.json()

        // Validate required fields
        if (!name || !address) {
            return NextResponse.json(
                { error: "Naam en adres zijn verplicht" },
                { status: 400 }
            )
        }

        // Create the new location
        const location = await prisma.location.create({
            data: {
                name,
                address,
                postalCode,
                country,
                organizationId
            },
            include: {
                _count: {
                    select: {
                        facilities: true
                    }
                }
            }
        })

        // Format the response
        const formattedLocation = {
            ...location,
            facilitiesCount: location._count.facilities,
            _count: undefined
        }

        return NextResponse.json(formattedLocation, { status: 201 })
    } catch (error) {
        console.error("Error creating location:", error)
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het aanmaken van de locatie" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        // Get the authenticated user
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: "Niet geautoriseerd" },
                { status: 401 }
            )
        }

        // Get organization directly from session or fetch from DB
        let organizationId: string | null = null;

        // Try getting organizationId from the session
        if (session.user.organizationId) {
            organizationId = session.user.organizationId as string;
        }
        // If not found in session, try to get from the database
        else {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { organizationId: true },
            });
            organizationId = dbUser?.organizationId || null;
        }

        // If we still don't have an organization, return an error
        if (!organizationId) {
            return NextResponse.json(
                { error: "Geen organisatie gevonden" },
                { status: 400 }
            );
        }

        // Extract locationId from the URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const locationId = pathParts[pathParts.length - 1];

        if (!locationId) {
            return NextResponse.json(
                { error: "Locatie ID is verplicht" },
                { status: 400 }
            );
        }

        // Verify the location belongs to the user's organization
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { organizationId: true }
        });

        if (!location) {
            return NextResponse.json(
                { error: "Locatie niet gevonden" },
                { status: 404 }
            );
        }

        if (location.organizationId !== organizationId) {
            return NextResponse.json(
                { error: "Je hebt geen toegang tot deze locatie" },
                { status: 403 }
            );
        }

        // Delete the location
        await prisma.location.delete({
            where: { id: locationId }
        });

        return NextResponse.json(
            { success: true, message: "Locatie succesvol verwijderd" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting location:", error);
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het verwijderen van de locatie" },
            { status: 500 }
        );
    }
} 