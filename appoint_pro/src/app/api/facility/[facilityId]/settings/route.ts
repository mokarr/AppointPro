import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { FacilityType } from "@prisma/client";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ facilityId: string }> }
) {
    try {
        const session = await auth();
        const resolvedParams = await params;
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settings = await prisma.facilitySettings.findUnique({
            where: {
                facilityId: resolvedParams.facilityId,
            },
        });

        if (!settings) {
            return NextResponse.json({
                data: {
                    type: FacilityType.PRIVATE
                }
            });
        }

        return NextResponse.json({ data: settings.data });
    } catch (error) {
        console.error("[FACILITY_SETTINGS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ facilityId: string }> }
) {
    try {
        const session = await auth();
        const resolvedParams = await params;
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        const settings = await prisma.facilitySettings.upsert({
            where: {
                facilityId: resolvedParams.facilityId,
            },
            update: {
                data: body,
            },
            create: {
                facilityId: resolvedParams.facilityId,
                data: body,
            },
        });

        return NextResponse.json({ data: settings.data });
    } catch (error) {
        console.error("[FACILITY_SETTINGS_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 