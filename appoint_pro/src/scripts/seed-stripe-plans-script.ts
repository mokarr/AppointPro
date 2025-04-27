import { PrismaClient } from "@prisma/client";
import Stripe from 'stripe';

// Initialize PrismaClient for scripts (doesn't use server-only restrictions)
const prisma = new PrismaClient({
    log: ["error"],
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-03-31.basil',
});

/**
 * Create subscription plans in database (used for initial setup)
 * This version avoids using server-only modules
 */
async function createSubscriptionPlans() {
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
            stripePriceId: "price_1RFwcNLSgAIRx4qabLPDlnbB",
            features: JSON.stringify([
                'Up to 5 employees',
                'Advanced appointment scheduling',
                'SMS notifications',
                'Online payments',
                'Customizable booking page',
            ]),
        },
        {
            name: 'Enterprise Plan',
            description: 'Full-featured solution for larger organizations',
            price: 99.99,
            interval: 'month',
            stripePriceId: "price_1RFwcpLSgAIRx4qa3DOZDuQF",
            features: JSON.stringify([
                'Unlimited employees',
                'Advanced analytics',
                'Priority support',
                'Custom branding',
                'API access',
                'Multiple locations',
            ]),
        },
    ];

    console.log('Creating subscription plans in database...');

    // Create or update each plan in the database
    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { stripePriceId: plan.stripePriceId },
            update: plan,
            create: plan,
        });
    }

    console.log('Subscription plans created successfully.');
}

/**
 * Script to seed the database with subscription plans
 * Run with: npx tsx -r tsconfig-paths/register src/scripts/seed-stripe-plans-script.ts
 */
async function main() {
    try {
        console.log('Starting subscription plan seeding...');
        await createSubscriptionPlans();
        console.log('Done!');
    } catch (error) {
        console.error('Error seeding subscription plans:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

// Run the script
main(); 