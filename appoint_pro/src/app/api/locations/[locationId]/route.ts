import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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