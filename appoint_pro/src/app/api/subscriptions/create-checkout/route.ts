import { NextRequest, NextResponse } from 'next/server';
import { createSubscriptionCheckoutSession } from '@/services/stripe-subscription';
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

        // Get the plan ID from the request body
        const { planId } = await req.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        // Create the checkout session
        const organizationId = session.user.organizationId;
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';

        const checkoutSession = await createSubscriptionCheckoutSession(
            organizationId,
            planId,
            `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            `${baseUrl}/subscription/cancel`
        );

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
} 