// app/api/facilities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const { locationId, name } = await request.json();

    try {
        // Controleer of de locatie bestaat
        const location = await prisma.location.findUnique({
            where: { id: locationId },
        });

        if (!location) {
            return NextResponse.json({ error: "Locatie bestaat niet" }, { status: 400 });
        }

        // Maak de faciliteit aan
        const facility = await prisma.facility.create({
            data: {
                name: name,
                locationId: location.id,
            },
        });

        return NextResponse.json(facility, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Er is iets mis gegaan" }, { status: 500 });
    }
}
