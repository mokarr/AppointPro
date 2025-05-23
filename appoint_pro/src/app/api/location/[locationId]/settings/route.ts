import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    try {
        const session = await auth();
        const resolvedParams = await params;
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settings = await prisma.locationSettings.findUnique({
            where: {
                locationId: resolvedParams.locationId,
            },
        });

        if (!settings) {
            return NextResponse.json({
                data: {
                    openingHours: [
                        { day: 'Maandag', open: '', close: '', isClosed: false },
                        { day: 'Dinsdag', open: '', close: '', isClosed: false },
                        { day: 'Woensdag', open: '', close: '', isClosed: false },
                        { day: 'Donderdag', open: '', close: '', isClosed: false },
                        { day: 'Vrijdag', open: '', close: '', isClosed: false },
                        { day: 'Zaterdag', open: '', close: '', isClosed: false },
                        { day: 'Zondag', open: '', close: '', isClosed: false },
                    ]
                }
            });
        }

        return NextResponse.json({ data: settings.data });
    } catch (error) {
        console.error("[LOCATION_SETTINGS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ locationId: string }> }
) {
    try {
        const session = await auth();
        const resolvedParams = await params;
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        const settings = await prisma.locationSettings.upsert({
            where: {
                locationId: resolvedParams.locationId,
            },
            update: {
                data: body,
            },
            create: {
                locationId: resolvedParams.locationId,
                data: body,
            },
        });

        return NextResponse.json({ data: settings.data });
    } catch (error) {
        console.error("[LOCATION_SETTINGS_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 