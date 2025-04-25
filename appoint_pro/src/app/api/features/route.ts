import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const features = await prisma.feature.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data: features })
    } catch (error) {
        console.error("Error fetching features:", error)
        return NextResponse.json(
            { success: false, error: "Er is een fout opgetreden bij het ophalen van de kenmerken" },
            { status: 500 }
        )
    }
} 