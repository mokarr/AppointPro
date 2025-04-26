import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSubscriptionCheckoutSession } from '@/services/stripe-subscription';
import { auth } from '@/lib/auth';
import { createLogger } from '@/utils/logger';

const logger = createLogger('stripe-checkout');

export async function POST(req: NextRequest) {
    logger.info('Received checkout session creation request');
    try {
        // Get user session
        logger.debug('Authenticating user');
        const session = await auth();
        logger.debug('Auth result:', {
            authenticated: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            organizationId: session?.user?.organizationId
        });

        if (!session?.user) {
            logger.error('Authentication failed - no session or user');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the plan ID from the request body
        logger.debug('Parsing request body');
        const body = await req.json();
        const { planId } = body;
        logger.debug('Request data:', { planId, bodyReceived: body });

        if (!planId) {
            logger.error('Missing required planId in request');
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        // Create the checkout session
        const organizationId = session.user.organizationId;
        const baseUrl = req.headers.get('origin') || 'http://localhost:3000';
        logger.info('Creating checkout session with params:', {
            organizationId,
            planId,
            baseUrl,
            successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/subscription/cancel`
        });

        try {
            const checkoutSession = await createSubscriptionCheckoutSession(
                organizationId,
                planId,
                `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                `${baseUrl}/subscription/cancel`
            );
            logger.info('Checkout session created successfully:', {
                sessionId: checkoutSession.id,
                url: checkoutSession.url,
                status: checkoutSession.status
            });

            return NextResponse.json({ url: checkoutSession.url });
        } catch (checkoutError) {
            logger.error('Error in createSubscriptionCheckoutSession:', checkoutError as Error);
            throw checkoutError; // Re-throw to be caught by outer try-catch
        }
    } catch (error) {
        logger.error('Error creating checkout session:', error as Error);

        // Log more details about the error
        if (error instanceof Error) {
            logger.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
} 