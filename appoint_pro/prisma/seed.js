const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const Stripe = require('stripe');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
    try {
        console.log('Starting database seeding...');

        // Create a test organization first
        const organization = await prisma.organization.upsert({
            where: { id: 'test-org' },
            update: {},
            create: {
                id: 'test-org',
                name: 'Test Organization',
                description: 'A test organization for development',
                branche: 'TEST',
            },
        });

        // Create a test user
        const hashedPassword = await hash('password123', 12);
        const user = await prisma.user.upsert({
            where: { email: 'test@example.com' },
            update: {},
            create: {
                email: 'test@example.com',
                name: 'Test User',
                password: hashedPassword,
                role: 'ADMIN',
                organization: {
                    connect: {
                        id: organization.id
                    }
                }
            },
        });

        // Define the plans
        const plans = [
            {
                id: 'basic-plan',
                name: 'Basic Plan',
                description: 'Access to basic appointment scheduling features',
                price: 19.99,
                interval: 'month',
                features: JSON.stringify([
                    'Up to 2 employees',
                    'Basic appointment scheduling',
                    'Email notifications',
                ]),
                active: true,
            },
            {
                id: 'pro-plan',
                name: 'Pro Plan',
                description: 'Advanced features for growing businesses',
                price: 49.99,
                interval: 'month',
                features: JSON.stringify([
                    'Up to 10 employees',
                    'Advanced appointment scheduling',
                    'SMS notifications',
                    'Custom branding',
                ]),
                active: true,
            },
            {
                id: 'enterprise-plan',
                name: 'Enterprise Plan',
                description: 'Full-featured solution for larger organizations',
                price: 99.99,
                interval: 'month',
                features: JSON.stringify([
                    'Unlimited employees',
                    'Priority support',
                    'Advanced analytics',
                    'API access',
                    'Custom integrations',
                ]),
                active: true,
            },
        ];

        // Check for existing products and prices in Stripe
        const existingProducts = await stripe.products.list({ limit: 100 });
        const existingPrices = await stripe.prices.list({ limit: 100 });

        for (const plan of plans) {
            // Check if product already exists
            let existingProduct = existingProducts.data.find(p => p.name === plan.name);

            if (!existingProduct) {
                console.log(`Creating Stripe product: ${plan.name}`);
                existingProduct = await stripe.products.create({
                    name: plan.name,
                    description: plan.description,
                });
            }

            // Check if price already exists for this product
            let existingPrice = existingPrices.data.find(
                p => p.product === existingProduct.id &&
                    p.unit_amount === Math.round(plan.price * 100) &&
                    p.currency === 'eur' &&
                    p.recurring?.interval === plan.interval
            );

            if (!existingPrice) {
                console.log(`Creating Stripe price for: ${plan.name}`);
                existingPrice = await stripe.prices.create({
                    product: existingProduct.id,
                    unit_amount: Math.round(plan.price * 100),
                    currency: 'eur',
                    recurring: {
                        interval: plan.interval,
                    },
                });
            }

            // Update plan with Stripe IDs
            const planWithStripeIds = {
                ...plan,
                stripePriceId: existingPrice.id
            };

            // Upsert the plan in our database
            await prisma.subscriptionPlan.upsert({
                where: { id: plan.id },
                update: planWithStripeIds,
                create: planWithStripeIds,
            });

            console.log(`Processed plan: ${plan.name}`);
        }

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    }); 