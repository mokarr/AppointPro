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
                { error: "Locatie niet gevonden" },
                { status: 404 }
            )
        }

        const facilities = await prisma.facility.findMany({
            where: { locationId },
            include: {
                features: true
            },
            orderBy: { name: "asc" }
        })

        return NextResponse.json(facilities)
    } catch (error) {
        console.error("Error fetching facilities:", error)
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het ophalen van de faciliteiten" },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    const { locationId } = await params;

    try {
        // Get the request body
        const { name, description, price, features } = await request.json()

        // Check if the location exists
        const location = await prisma.location.findUnique({
            where: { id: locationId },
        })

        if (!location) {
            return NextResponse.json(
                { error: "Locatie niet gevonden" },
                { status: 404 }
            )
        }

        const facility = await prisma.facility.create({
            data: {
                name,
                description,
                price: parseFloat(price.toString()),
                locationId,
                features: {
                    connect: features.map((feature: { id: string }) => ({ id: feature.id }))
                }
            },
            include: {
                features: true
            }
        })

        return NextResponse.json(facility, { status: 201 })
    } catch (error) {
        console.error("Error creating facility:", error)
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het aanmaken van de faciliteit" },
            { status: 500 }
        )
    }
} 