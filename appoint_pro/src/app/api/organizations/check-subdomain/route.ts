import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subdomain = searchParams.get('subdomain');

        if (!subdomain) {
            return NextResponse.json(
                { error: 'Subdomain parameter is required' },
                { status: 400 }
            );
        }

        // Check if organization with this subdomain exists
        const organization = await prisma.organization.findFirst({
            where: {
                subdomain,
                // Optionally check for active subscription if needed
                // hasActiveSubscription: true
            },
        });

        // Return both the existence flag and the organizationId if found
        return NextResponse.json({
            exists: !!organization,
            organizationId: organization?.id || null
        });
    } catch (error) {
        console.error('Error checking organization subdomain:', error);
        return NextResponse.json(
            { error: 'Failed to check organization' },
            { status: 500 }
        );
    }
} 