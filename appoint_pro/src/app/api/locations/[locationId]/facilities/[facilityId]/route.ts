import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locationId: string; facilityId: string }> }
) {
    const { locationId, facilityId } = await params;

    try {
        // Check if the facility exists and belongs to the location
        const facility = await prisma.facility.findFirst({
            where: {
                id: facilityId,
                locationId: locationId
            },
            include: {
                features: true,
                location: {
                    select: {
                        name: true,
                        address: true
                    }
                }
            }
        });

        if (!facility) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Faciliteit niet gevonden of behoort niet tot deze locatie",
                    belongsToLocation: false
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: facility,
            belongsToLocation: true
        });
    } catch (error) {
        console.error("Error fetching facility:", error);
        return NextResponse.json(
            { success: false, error: "Er is een fout opgetreden bij het ophalen van de faciliteit" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ locationId: string; facilityId: string }> }
) {
    try {
        const { locationId, facilityId } = await params;

        // Get the authenticated user
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Niet geautoriseerd" },
                { status: 401 }
            );
        }

        // Verify the facility exists and belongs to the specified location
        const facility = await prisma.facility.findFirst({
            where: {
                id: facilityId,
                locationId: locationId
            },
            select: {
                id: true,
                name: true,
                location: {
                    select: {
                        organizationId: true
                    }
                }
            }
        });

        if (!facility) {
            return NextResponse.json(
                { error: "Faciliteit niet gevonden of behoort niet tot deze locatie" },
                { status: 404 }
            );
        }

        // Verify user has permission to delete this facility (from the same organization)
        let organizationId: string | null = null;

        // Try getting organizationId from the session
        if (session.user.organizationId) {
            organizationId = session.user.organizationId as string;
        } else {
            // If not in session, get from database
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { organizationId: true },
            });
            organizationId = dbUser?.organizationId || null;
        }

        if (!organizationId || facility.location.organizationId !== organizationId) {
            return NextResponse.json(
                { error: "Je hebt geen toegang tot deze faciliteit" },
                { status: 403 }
            );
        }

        // Check if the facility has any bookings
        const bookingsCount = await prisma.booking.count({
            where: { facilityId }
        });

        if (bookingsCount > 0) {
            return NextResponse.json(
                {
                    error: "Kan faciliteit niet verwijderen omdat er nog boekingen zijn",
                    code: "BOOKINGS_EXIST"
                },
                { status: 400 }
            );
        }

        // Delete the facility
        await prisma.facility.delete({
            where: { id: facilityId }
        });

        return NextResponse.json({
            success: true,
            message: `Faciliteit "${facility.name}" succesvol verwijderd`,
            id: facilityId
        });
    } catch (error) {
        console.error("Error deleting facility:", error);
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het verwijderen van de faciliteit" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ locationId: string; facilityId: string }> }
) {
    try {
        const { locationId, facilityId } = await params;

        // Get the authenticated user
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Niet geautoriseerd" },
                { status: 401 }
            );
        }

        // Verify the facility exists and belongs to the specified location
        const facility = await prisma.facility.findFirst({
            where: {
                id: facilityId,
                locationId: locationId
            },
            select: {
                id: true,
                location: {
                    select: {
                        organizationId: true
                    }
                }
            }
        });

        if (!facility) {
            return NextResponse.json(
                { error: "Faciliteit niet gevonden of behoort niet tot deze locatie" },
                { status: 404 }
            );
        }

        // Verify user has permission to update this facility
        let organizationId: string | null = null;

        if (session.user.organizationId) {
            organizationId = session.user.organizationId as string;
        } else {
            const dbUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { organizationId: true },
            });
            organizationId = dbUser?.organizationId || null;
        }

        if (!organizationId || facility.location.organizationId !== organizationId) {
            return NextResponse.json(
                { error: "Je hebt geen toegang tot deze faciliteit" },
                { status: 403 }
            );
        }

        // Parse the request body
        const { name, description, price, features } = await request.json();

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Naam is verplicht" },
                { status: 400 }
            );
        }

        // Update the facility
        const updatedFacility = await prisma.facility.update({
            where: { id: facilityId },
            data: {
                name,
                description,
                price: parseFloat(price.toString()),
                // Disconnect all existing features and connect the new ones
                features: {
                    set: features.map((feature: { id: string }) => ({ id: feature.id }))
                }
            },
            include: {
                features: true
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedFacility,
            message: "Faciliteit succesvol bijgewerkt"
        });
    } catch (error) {
        console.error("Error updating facility:", error);
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het bijwerken van de faciliteit" },
            { status: 500 }
        );
    }
} 