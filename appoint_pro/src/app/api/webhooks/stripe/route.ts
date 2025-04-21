import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { db } from '@/lib/server';
import { updateSubscriptionInDatabase } from '@/services/stripe-subscription';
import { activateOrganizationSubdomain } from '@/services/organization';
import type { Stripe } from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
    current_period_start: number;
    current_period_end: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        if (!webhookSecret) {
            return NextResponse.json(
                { error: 'Webhook secret is not set' },
                { status: 500 }
            );
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: unknown) {
            const error = err as Error;
            console.error(`Webhook signature verification failed: ${error.message}`);
            return NextResponse.json(
                { error: `Webhook signature verification failed: ${error.message}` },
                { status: 400 }
            );
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // If this is a subscription, handle it
                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const organizationId = session.metadata?.organizationId;

                    if (organizationId && subscriptionId) {
                        // Get full subscription details from Stripe
                        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as StripeSubscriptionWithPeriod;
                        const priceId = subscription.items.data[0].price.id;

                        // Get plan details from the database
                        const plan = await db.subscriptionPlan.findFirst({
                            where: { stripePriceId: priceId },
                        });

                        if (plan) {
                            // Update subscription in database
                            await updateSubscriptionInDatabase(subscriptionId, {
                                organizationId,
                                status: subscription.status,
                                priceId,
                                planName: plan.name,
                                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                            });

                            // If subscription is active, ensure the organization has a subdomain
                            if (subscription.status === 'active') {
                                await activateOrganizationSubdomain(organizationId);

                                // Set organization's hasActiveSubscription flag to true
                                await db.organization.update({
                                    where: { id: organizationId },
                                    data: { hasActiveSubscription: true }
                                });
                            }
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as StripeSubscriptionWithPeriod;

                // Find the organization by Stripe customer ID
                const organization = await db.organization.findFirst({
                    where: { stripeCustomerId: subscription.customer as string },
                });

                if (organization) {
                    const priceId = subscription.items.data[0].price.id;

                    // Get plan details from the database
                    const plan = await db.subscriptionPlan.findFirst({
                        where: { stripePriceId: priceId },
                    });

                    if (plan) {
                        // Update subscription in database
                        await updateSubscriptionInDatabase(subscription.id, {
                            organizationId: organization.id,
                            status: subscription.status,
                            priceId,
                            planName: plan.name,
                            currentPeriodStart: new Date(subscription.current_period_start * 1000),
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        });

                        // If subscription status changed to active, ensure organization has a subdomain
                        // and update hasActiveSubscription flag
                        const isActive = subscription.status === 'active';

                        if (isActive) {
                            await activateOrganizationSubdomain(organization.id);

                            if (!organization.hasActiveSubscription) {
                                await db.organization.update({
                                    where: { id: organization.id },
                                    data: { hasActiveSubscription: true }
                                });
                            }
                        } else if (!isActive && organization.hasActiveSubscription) {
                            // If subscription is no longer active, update the flag
                            await db.organization.update({
                                where: { id: organization.id },
                                data: { hasActiveSubscription: false }
                            });
                        }
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Find subscription in database
                const dbSubscription = await db.subscription.findUnique({
                    where: { stripeSubscriptionId: subscription.id },
                });

                if (dbSubscription) {
                    // Update subscription status to canceled
                    await updateSubscriptionInDatabase(subscription.id, {
                        status: 'canceled',
                        cancelAtPeriodEnd: true,
                    });

                    // Set organization's hasActiveSubscription flag to false
                    await db.organization.update({
                        where: { id: dbSubscription.organizationId },
                        data: { hasActiveSubscription: false }
                    });
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
} 