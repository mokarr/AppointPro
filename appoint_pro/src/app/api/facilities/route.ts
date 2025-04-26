// app/api/facilities/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const features = searchParams.getAll('features');

    try {
        // Top-level filters with mode
        const topLevelOrFilters: Prisma.FacilityWhereInput[] = search
            ? [
                { name: { contains: search, mode: 'insensitive' } as Prisma.StringFilter },
                { description: { contains: search, mode: 'insensitive' } as Prisma.StringFilter }
            ]
            : [];
        // Nested filters without mode
        const nestedOrFilters: Prisma.FacilityWhereInput[] = search
            ? [
                { location: { name: { contains: search } } },
                { location: { address: { contains: search } } }
            ]
            : [];
        const orFilters: Prisma.FacilityWhereInput[] = [...topLevelOrFilters, ...nestedOrFilters];

        // Build AND filters for price
        const andFilters: Prisma.FacilityWhereInput[] = [];
        if (minPrice !== undefined) {
            andFilters.push({ price: { gte: minPrice } });
        }
        if (maxPrice !== undefined) {
            andFilters.push({ price: { lte: maxPrice } });
        }

        // Construct the whereClause
        const whereClause: Prisma.FacilityWhereInput = {};
        if (orFilters.length > 0) {
            whereClause.OR = orFilters;
        }
        if (andFilters.length > 0) {
            whereClause.AND = andFilters;
        }

        // Features filtering will be done in-memory after fetching
        // as it depends on the facility features implementation

        // Fetch facilities with their location and features
        const facilities = await prisma.facility.findMany({
            where: whereClause,
            include: {
                location: {
                    include: {
                        organization: true
                    }
                },
                features: true
            },
            orderBy: { name: 'asc' }
        });

        // Transform facilities to match the expected format
        const formattedFacilities = facilities.map(facility => {
            // Extract feature IDs from the facility
            const facilityFeatures = facility.features.map(feature => feature.category);

            // Filter by features if specified
            if (features.length > 0 && !features.every(feature => facilityFeatures.includes(feature))) {
                return null; // Skip this facility if it doesn't have all requested features
            }

            // Get the organization name from the location's organization
            const organizationName = facility.location.organization?.name || 'N/A';

            // Format the facility data based on your actual data model
            return {
                id: facility.id,
                title: facility.name,
                organization: organizationName,
                location: facility.location.name,
                address: facility.location.address,
                price: facility.price,
                availableSpots: 0, // Default value since not in model
                features: facilityFeatures,
                // Mock opening hours for demo - in a real app, this would come from the database
                openingHours: {
                    open: "09:00",
                    close: "18:00"
                }
            };
        }).filter(Boolean); // Remove null entries (filtered out by features)

        return NextResponse.json(formattedFacilities);
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { locationId, name, description, price } = await request.json();

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
                name,
                description,
                price,
                locationId: location.id,
            },
        });

        return NextResponse.json(facility, { status: 201 });
    } catch (error) {
        console.error('Error creating facility:', error);
        return NextResponse.json({ error: "Er is iets mis gegaan" }, { status: 500 });
    }
}
