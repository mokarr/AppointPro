import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/services/stripe-subscription';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Get user session
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Create the portal session
        const organizationId = session.user.organizationId;
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';

        const portalSession = await createCustomerPortalSession(
            organizationId,
            `${baseUrl}/dashboard`
        );

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
} 