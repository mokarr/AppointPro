import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    const { locationId } = await params;

    try {
        // Check if the location exists
        const location = await prisma.location.findUnique({
            where: { id: locationId },
        })

        if (!location) {
            return NextResponse.json(
                { success: false, error: "Locatie niet gevonden" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: location })
    } catch (error) {
        console.error("Error fetching location:", error)
        return NextResponse.json(
            { success: false, error: "Er is een fout opgetreden bij het ophalen van de locatie" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    try {
        const { locationId } = await params;

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

        // Verify the location belongs to the user's organization
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { organizationId: true, name: true }
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

        // Check if any facilities in this location have bookings
        const facilitiesWithBookings = await prisma.facility.findMany({
            where: {
                locationId,
                bookings: {
                    some: {}
                }
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        bookings: true
                    }
                }
            }
        });

        if (facilitiesWithBookings.length > 0) {
            const facilityNames = facilitiesWithBookings.map(f => f.name).join(", ");
            return NextResponse.json(
                {
                    error: "Kan locatie niet verwijderen omdat er nog faciliteiten zijn met boekingen",
                    details: `De volgende faciliteiten hebben nog boekingen: ${facilityNames}`,
                    code: "BOOKINGS_EXIST"
                },
                { status: 400 }
            );
        }

        // First, check if location has facilities
        const facilitiesCount = await prisma.facility.count({
            where: { locationId }
        });

        if (facilitiesCount > 0) {
            // Delete all facilities first
            await prisma.facility.deleteMany({
                where: { locationId }
            });
        }

        // Delete the location
        await prisma.location.delete({
            where: { id: locationId }
        });

        return NextResponse.json({
            success: true,
            message: `Locatie "${location.name}" succesvol verwijderd`,
            id: locationId
        });
    } catch (error) {
        console.error("Error deleting location:", error);

        // Check for specific error types
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates foreign key constraint')) {
            return NextResponse.json(
                {
                    error: "Kan locatie niet verwijderen omdat er nog boekingen zijn voor faciliteiten op deze locatie",
                    code: "CONSTRAINT_ERROR"
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het verwijderen van de locatie" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    try {
        const { locationId } = await params;

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

        // Parse the request body
        const { name, address, postalCode, country } = await request.json();

        // Validate required fields
        if (!name || !address) {
            return NextResponse.json(
                { error: "Naam en adres zijn verplicht" },
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

        // Update the location
        const updatedLocation = await prisma.location.update({
            where: { id: locationId },
            data: {
                name,
                address,
                postalCode,
                country
            },
            include: {
                _count: {
                    select: {
                        facilities: true
                    }
                }
            }
        });

        // Format the response
        const formattedLocation = {
            ...updatedLocation,
            facilitiesCount: updatedLocation._count.facilities,
            _count: undefined
        };

        return NextResponse.json(formattedLocation);
    } catch (error) {
        console.error("Error updating location:", error);
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het bijwerken van de locatie" },
            { status: 500 }
        );
    }
} 