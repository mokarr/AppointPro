import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { db } from '@/lib/server';
import { updateSubscriptionInDatabase } from '@/services/stripe-subscription';
import { activateOrganizationSubdomain } from '@/services/organization';
import type { Stripe } from 'stripe';
import { createLogger } from '@/utils/logger';

const logger = createLogger('stripe-webhook');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
    current_period_start: number;
    current_period_end: number;
}

// Extend Stripe.Invoice to include subscription property that might be missing in the type definition
interface StripeInvoice extends Stripe.Invoice {
    subscription?: string;
}

export async function POST(req: NextRequest) {
    logger.info('Received webhook request');
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;
        logger.debug('Got signature:', signature ? 'Present' : 'Missing');

        if (!webhookSecret) {
            logger.error('Webhook secret is not set in environment variables');
            return NextResponse.json(
                { error: 'Webhook secret is not set' },
                { status: 500 }
            );
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            logger.info('Event constructed successfully:', { type: event.type, id: event.id });
        } catch (err: unknown) {
            const error = err as Error;
            logger.error('Signature verification failed:', { error: error.message });
            return NextResponse.json(
                { error: `Webhook signature verification failed: ${error.message}` },
                { status: 400 }
            );
        }

        // Handle the event
        logger.debug(`Processing event type: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                logger.info('Checkout session completed:', {
                    sessionId: session.id,
                    mode: session.mode,
                    subscriptionId: session.subscription,
                    customerId: session.customer,
                    metadata: session.metadata
                });

                // If this is a subscription, handle it
                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const organizationId = session.metadata?.organizationId;
                    logger.info('Subscription checkout:', { subscriptionId, organizationId });

                    if (organizationId && subscriptionId) {
                        try {
                            // Get full subscription details from Stripe
                            logger.debug('Retrieving subscription details from Stripe:', subscriptionId);
                            const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as StripeSubscriptionWithPeriod;
                            const priceId = subscription.items.data[0].price.id;
                            logger.debug('Subscription retrieved:', {
                                status: subscription.status,
                                priceId,
                                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                cancelAtPeriodEnd: subscription.cancel_at_period_end
                            });

                            // Get plan details from the database
                            logger.debug('Finding plan with priceId:', priceId);
                            const plan = await db.subscriptionPlan.findFirst({
                                where: { stripePriceId: priceId },
                            });
                            logger.debug('Plan found:', plan ? { id: plan.id, name: plan.name } : 'No plan found');

                            if (plan) {
                                // Update subscription in database
                                logger.debug('Updating subscription in database');
                                await updateSubscriptionInDatabase(subscriptionId, {
                                    organizationId,
                                    status: subscription.status,
                                    priceId,
                                    planName: plan.name,
                                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                                });
                                logger.info('Subscription updated in database');

                                // If subscription is active, ensure the organization has a subdomain
                                if (subscription.status === 'active') {
                                    logger.info('Activating organization subdomain');
                                    await activateOrganizationSubdomain(organizationId);
                                    logger.info('Organization subdomain activated');

                                    // Set organization's hasActiveSubscription flag to true
                                    logger.info('Updating organization.hasActiveSubscription to true');
                                    await db.organization.update({
                                        where: { id: organizationId },
                                        data: { hasActiveSubscription: true }
                                    });
                                    logger.info('Organization updated: hasActiveSubscription = true');
                                }
                            } else {
                                logger.error('Could not find corresponding plan in the database for priceId:', priceId);
                            }
                        } catch (error) {
                            logger.error('Error processing checkout.session.completed:', error);
                        }
                    } else {
                        logger.error('Missing required data:', {
                            hasSubscriptionId: !!subscriptionId,
                            hasOrganizationId: !!organizationId
                        });
                    }
                } else {
                    logger.debug('Non-subscription checkout session, ignoring');
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as StripeSubscriptionWithPeriod;
                logger.info(`${event.type}:`, {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    customerId: subscription.customer
                });

                try {
                    // Find the organization by Stripe customer ID
                    logger.debug('Finding organization with stripeCustomerId:', subscription.customer);
                    const organization = await db.organization.findFirst({
                        where: { stripeCustomerId: subscription.customer as string },
                    });
                    logger.debug('Organization found:', organization ? { id: organization.id, name: organization.name } : 'No organization found');

                    if (organization) {
                        const priceId = subscription.items.data[0].price.id;
                        logger.debug('Subscription price ID:', priceId);

                        // Get plan details from the database
                        logger.debug('Finding plan with priceId:', priceId);
                        const plan = await db.subscriptionPlan.findFirst({
                            where: { stripePriceId: priceId },
                        });
                        logger.debug('Plan found:', plan ? { id: plan.id, name: plan.name } : 'No plan found');

                        if (plan) {
                            // Update subscription in database
                            logger.debug('Updating subscription in database');
                            await updateSubscriptionInDatabase(subscription.id, {
                                organizationId: organization.id,
                                status: subscription.status,
                                priceId,
                                planName: plan.name,
                                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                            });
                            logger.info('Subscription updated in database');

                            // If subscription status changed to active, ensure organization has a subdomain
                            // and update hasActiveSubscription flag
                            const isActive = subscription.status === 'active';
                            logger.debug('Subscription active status:', isActive);

                            if (isActive) {
                                logger.info('Activating organization subdomain');
                                await activateOrganizationSubdomain(organization.id);
                                logger.info('Organization subdomain activated');

                                if (!organization.hasActiveSubscription) {
                                    logger.info('Updating organization.hasActiveSubscription to true');
                                    await db.organization.update({
                                        where: { id: organization.id },
                                        data: { hasActiveSubscription: true }
                                    });
                                    logger.info('Organization updated: hasActiveSubscription = true');
                                } else {
                                    logger.debug('Organization already has active subscription, no update needed');
                                }
                            } else if (!isActive && organization.hasActiveSubscription) {
                                // If subscription is no longer active, update the flag
                                logger.info('Updating organization.hasActiveSubscription to false');
                                await db.organization.update({
                                    where: { id: organization.id },
                                    data: { hasActiveSubscription: false }
                                });
                                logger.info('Organization updated: hasActiveSubscription = false');
                            }
                        } else {
                            logger.error('Could not find corresponding plan in the database for priceId:', priceId);
                        }
                    } else {
                        logger.error('Could not find organization with stripeCustomerId:', subscription.customer);
                    }
                } catch (error) {
                    logger.error(`Error processing ${event.type}:`, error);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                logger.info('Subscription deleted:', {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    customerId: subscription.customer
                });

                try {
                    // Find subscription in database
                    logger.debug('Finding subscription in database:', subscription.id);
                    const dbSubscription = await db.subscription.findUnique({
                        where: { stripeSubscriptionId: subscription.id },
                    });
                    logger.debug('Database subscription found:', dbSubscription ? { id: dbSubscription.id, organizationId: dbSubscription.organizationId } : 'Not found');

                    if (dbSubscription) {
                        // Update subscription status to canceled
                        logger.info('Updating subscription to canceled status');
                        await updateSubscriptionInDatabase(subscription.id, {
                            status: 'canceled',
                            cancelAtPeriodEnd: true,
                        });
                        logger.info('Subscription updated to canceled status');

                        // Set organization's hasActiveSubscription flag to false
                        logger.info('Updating organization.hasActiveSubscription to false');
                        await db.organization.update({
                            where: { id: dbSubscription.organizationId },
                            data: { hasActiveSubscription: false }
                        });
                        logger.info('Organization updated: hasActiveSubscription = false');
                    } else {
                        logger.error('Could not find subscription in database:', subscription.id);
                    }
                } catch (error) {
                    logger.error('Error processing customer.subscription.deleted:', error);
                }
                break;
            }

            // Add handlers for invoice events
            case 'invoice.paid': {
                const invoice = event.data.object as StripeInvoice;
                logger.info('Invoice paid:', {
                    invoiceId: invoice.id,
                    customerId: invoice.customer,
                    subscriptionId: invoice.subscription
                });

                // If this is a subscription invoice, we need to ensure the subscription is active
                if (invoice.subscription && typeof invoice.subscription === 'string') {
                    try {
                        logger.debug('Processing paid invoice for subscription:', invoice.subscription);
                        const subscription = await db.subscription.findFirst({
                            where: { stripeSubscriptionId: invoice.subscription }
                        });

                        if (subscription) {
                            logger.info('Ensuring subscription is marked as active');
                            await updateSubscriptionInDatabase(invoice.subscription, {
                                status: 'active',
                                organizationId: subscription.organizationId
                            });
                        } else {
                            logger.warn('Paid invoice for unknown subscription:', invoice.subscription);
                        }
                    } catch (error) {
                        logger.error('Error processing invoice.paid event:', error);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as StripeInvoice;
                logger.warn('Invoice payment failed:', {
                    invoiceId: invoice.id,
                    customerId: invoice.customer,
                    subscriptionId: invoice.subscription
                });

                if (invoice.subscription && typeof invoice.subscription === 'string') {
                    try {
                        logger.debug('Processing failed invoice for subscription:', invoice.subscription);
                        const subscription = await db.subscription.findFirst({
                            where: { stripeSubscriptionId: invoice.subscription }
                        });

                        if (subscription) {
                            logger.info('Marking subscription as past_due');
                            await updateSubscriptionInDatabase(invoice.subscription, {
                                status: 'past_due',
                                organizationId: subscription.organizationId
                            });
                        } else {
                            logger.warn('Failed invoice for unknown subscription:', invoice.subscription);
                        }
                    } catch (error) {
                        logger.error('Error processing invoice.payment_failed event:', error);
                    }
                }
                break;
            }

            default:
                logger.debug(`Unhandled event type: ${event.type}`);
        }

        logger.info('Successfully processed webhook');
        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error('Webhook handler failed:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
} 