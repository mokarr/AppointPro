import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

// Create a separate instance to bypass TypeScript errors
const prisma = new PrismaClient()

export async function GET() {
    try {
        const features = await prisma.$queryRaw`SELECT * FROM Feature ORDER BY name ASC`
        return NextResponse.json(features)
    } catch (error) {
        console.error("Error fetching features:", error)
        return NextResponse.json(
            { error: "Er is een fout opgetreden bij het ophalen van de kenmerken" },
            { status: 500 }
        )
    }
} 