import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { FacilityType } from "@prisma/client";

export async function GET(
    request: Request,
    { params }: { params: { facilityId: string } }
) {
    try {
        const session = await auth();

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settings = await prisma.settings.findUnique({
            where: {
                facilityId: params.facilityId,
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
    { params }: { params: { facilityId: string } }
) {
    try {
        const session = await auth();

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        const settings = await prisma.settings.upsert({
            where: {
                facilityId: params.facilityId,
            },
            update: {
                data: body,
            },
            create: {
                facilityId: params.facilityId,
                type: "FACILITY",
                data: body,
            },
        });

        return NextResponse.json({ data: settings.data });
    } catch (error) {
        console.error("[FACILITY_SETTINGS_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
} 