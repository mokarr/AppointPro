import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: { locationId: string } }
) {
    // In Next.js 14+, we need to await params before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const locationId = resolvedParams.locationId;

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

        // TypeScript doesn't properly recognize the Prisma schema relationships
        // Using 'as any' to bypass type checking
        const facilities = await (prisma.facility.findMany as any)({
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
    { params }: { params: { locationId: string } }
) {
    // In Next.js 14+, we need to await params before accessing its properties
    const resolvedParams = await Promise.resolve(params);
    const locationId = resolvedParams.locationId;

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

        // TypeScript doesn't properly recognize the Prisma schema relationships
        // Using 'as any' to bypass type checking
        const facility = await (prisma.facility.create as any)({
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