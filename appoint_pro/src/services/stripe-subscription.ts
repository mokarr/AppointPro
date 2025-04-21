import { db } from '@/lib/server';
import stripe from '@/lib/stripe';

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
        });

        if (!organization) {
            console.log(`Organization not found: ${organizationId}`);
            return false;
        }

        // Use the flag from the organization table as the source of truth
        // This is more reliable than checking subscriptions directly each time
        const hasSubscription = organization.hasActiveSubscription;

        console.log(`Organization ${organizationId} hasActiveSubscription: ${hasSubscription}`);

        return hasSubscription;
    } catch (error) {
        console.error(`Error checking subscription status for org ${organizationId}:`, error);
        // Default to true in case of errors to prevent blocking users
        // It's better to potentially give access than to completely block users
        return true;
    }
};

/**
 * Update a subscription in the database
 */
export const updateSubscriptionInDatabase = async (stripeSubscriptionId: string, data: any) => {
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
            },
        });
    }

    // Update organization subscription status
    await updateOrganizationSubscriptionStatus(data.organizationId);
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

