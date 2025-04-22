import { db } from '@/lib/server';
import stripe from '@/lib/stripe';
import type { Stripe } from 'stripe';
import type { Subscription } from '@prisma/client';

// type SubscriptionUpdateData = {
//     status?: string;
//     currentPeriodEnd?: Date;
//     cancelAtPeriodEnd?: boolean;
//     priceId?: string;
//     planName?: string;
//     currentPeriodStart?: Date;
//     organizationId?: string;
//     [key: string]: unknown;
// };

interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
    current_period_start: number;
    current_period_end: number;
}

/**
 * Create or retrieve a Stripe customer for an organization
 */
export const getOrCreateCustomer = async (organizationId: string) => {
    const organization = await db.organization.findUnique({
        where: { id: organizationId },
    });

    if (!organization) {
        throw new Error('Organization not found');
    }

    // If the organization already has a stripeCustomerId, return it
    if (organization.stripeCustomerId) {
        return organization.stripeCustomerId;
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
        name: organization.name,
        metadata: {
            organizationId: organization.id,
        },
    });

    // Save the customer ID to the organization
    await db.organization.update({
        where: { id: organization.id },
        data: {
            stripeCustomerId: customer.id,
        },
    });

    return customer.id;
};

/**
 * Create a checkout session for a subscription
 */
export const createSubscriptionCheckoutSession = async (
    organizationId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
) => {
    // Get the customer ID
    const customerId = await getOrCreateCustomer(organizationId);

    // Get the plan from the database
    const plan = await db.subscriptionPlan.findUnique({
        where: { id: planId },
    });

    if (!plan) {
        throw new Error('Subscription plan not found');
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card', 'ideal'],
        line_items: [
            {
                price: plan.stripePriceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            organizationId,
            planId,
        },
        locale: 'nl', // Set locale to Dutch for iDEAL
    });

    return session;
};

/**
 * Create a customer portal session
 */
export const createCustomerPortalSession = async (
    organizationId: string,
    returnUrl: string
) => {
    const customerId = await getOrCreateCustomer(organizationId);

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
};

/**
 * Check if an organization has an active subscription
 */
export const hasActiveSubscription = async (organizationId: string): Promise<boolean> => {
    try {
        console.log(`Checking subscription for organization: ${organizationId}`);

        if (!organizationId) {
            console.log('No organizationId provided to hasActiveSubscription');
            return false;
        }

        // First check if the organization exists
        const organization = await db.organization.findUnique({
            where: { id: organizationId },
            include: {
                subscriptions: {
                    where: {
                        status: 'active',
                        currentPeriodEnd: {
                            gt: new Date(),
                        },
                    },
                },
            },
        });

        if (!organization) {
            console.log(`Organization not found: ${organizationId}`);
            return false;
        }

        // Check for any discrepancy between the flag and actual subscriptions
        const hasActiveSubscriptionsInDb = organization.subscriptions.length > 0;

        // If there's a discrepancy, update the flag in the database
        if (hasActiveSubscriptionsInDb !== organization.hasActiveSubscription) {
            console.log(`Fixing subscription status discrepancy for organization ${organizationId}`);
            await db.organization.update({
                where: { id: organizationId },
                data: { hasActiveSubscription: hasActiveSubscriptionsInDb },
            });
            return hasActiveSubscriptionsInDb;
        }

        // Use the flag from the organization table as the source of truth
        const hasSubscription = organization.hasActiveSubscription;
        console.log(`Organization ${organizationId} hasActiveSubscription: ${hasSubscription}`);

        return hasSubscription;
    } catch (error) {
        console.error(`Error checking subscription status for org ${organizationId}:`, error);
        // Default to false in case of errors to be safe
        // Better to require explicit subscription validation than give access incorrectly
        return false;
    }
};

/**
 * Update a subscription in the database
 */
export const updateSubscriptionInDatabase = async (stripeSubscriptionId: string, data: Partial<Subscription>) => {
    const subscription = await db.subscription.findUnique({
        where: { stripeSubscriptionId },
    });

    if (subscription) {
        // Update existing subscription
        await db.subscription.update({
            where: { id: subscription.id },
            data,
        });
    } else {
        // Create new subscription if it doesn't exist
        await db.subscription.create({
            data: {
                ...data,
                stripeSubscriptionId,
            } as Subscription,
        });
    }

    // Update organization subscription status
    if (data.organizationId) {
        await updateOrganizationSubscriptionStatus(data.organizationId);
    }
};

/**
 * Update the subscription status for an organization
 */
export const updateOrganizationSubscriptionStatus = async (organizationId: string) => {
    const activeSubscriptions = await db.subscription.findMany({
        where: {
            organizationId,
            status: 'active',
            currentPeriodEnd: {
                gt: new Date(),
            },
        },
    });

    await db.organization.update({
        where: { id: organizationId },
        data: {
            hasActiveSubscription: activeSubscriptions.length > 0,
        },
    });
};

/**
 * Create subscription plans in database (used for initial setup)
 */
export const createSubscriptionPlans = async () => {
    const plans = [
        {
            name: 'Basic Plan',
            description: 'Access to basic appointment scheduling features',
            price: 19.99,
            interval: 'month',
            stripePriceId: "price_1RFwbXLSgAIRx4qagPSkw5fJ",
            features: JSON.stringify([
                'Up to 2 employees',
                'Basic appointment scheduling',
                'Email notifications',
            ]),
        },
        {
            name: 'Pro Plan',
            description: 'Advanced features for growing businesses',
            price: 49.99,
            interval: 'month',
            stripePriceId: "price_1RFwbXLSgAIRx4qaeFQWntkA",
            features: JSON.stringify([
                'Up to 10 employees',
                'Advanced appointment scheduling',
                'SMS notifications',
                'Custom branding',
            ]),
        },
        {
            name: 'Enterprise Plan',
            description: 'Full-featured solution for larger organizations',
            price: 99.99,
            interval: 'month',
            stripePriceId: "price_1RFwbYLSgAIRx4qa4k7Zb0Ln",
            features: JSON.stringify([
                'Unlimited employees',
                'Priority support',
                'Advanced analytics',
                'API access',
                'Custom integrations',
            ]),
        },
    ];

    // First, delete all existing plans
    await db.subscriptionPlan.deleteMany({});

    // Then create the new plans
    await db.subscriptionPlan.createMany({
        data: plans,
    });
};

/**
 * Sync active subscriptions with Stripe
 */
export const syncActiveSubscriptions = async () => {
    try {
        // Get all active subscriptions from the database
        const activeSubscriptions = await db.subscription.findMany({
            where: {
                status: 'active',
                currentPeriodEnd: {
                    gt: new Date(),
                },
            },
            include: {
                organization: true,
            },
        });

        // Sync each subscription with Stripe
        for (const subscription of activeSubscriptions) {
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId) as unknown as StripeSubscriptionWithPeriod;

                // Update subscription in database if needed
                await updateSubscriptionInDatabase(subscription.stripeSubscriptionId, {
                    status: stripeSubscription.status,
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                    organizationId: subscription.organizationId,
                    priceId: subscription.priceId,
                    planName: subscription.planName,
                    currentPeriodStart: subscription.currentPeriodStart,
                });
            } catch (error) {
                console.error(`Error syncing subscription ${subscription.stripeSubscriptionId}:`, error);
                // If the subscription doesn't exist in Stripe, mark it as cancelled
                if (error instanceof Error && 'code' in error && error.code === 'resource_missing') {
                    await updateSubscriptionInDatabase(subscription.stripeSubscriptionId, {
                        status: 'cancelled',
                        organizationId: subscription.organizationId,
                        priceId: subscription.priceId,
                        planName: subscription.planName,
                        currentPeriodStart: subscription.currentPeriodStart,
                        currentPeriodEnd: subscription.currentPeriodEnd,
                    });
                }
            }
        }

        return { success: true, message: 'Subscriptions synced successfully' };
    } catch (error) {
        console.error('Error syncing subscriptions:', error);
        return { success: false, error: 'Failed to sync subscriptions' };
    }
};

