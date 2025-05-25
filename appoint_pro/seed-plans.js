// seed-plans.js
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Creating subscription plans in database...');

        // Define the plans
        const plans = [
            {
                name: 'Basic Plan',
                description: 'Access to basic appointment scheduling features',
                price: 19.99,
                interval: 'month',
                stripePriceId: 'price_1RFwbXLSgAIRx4qagPSkw5fJ',
                features: JSON.stringify([
                    'Up to 2 employees',
                    'Basic appointment scheduling',
                    'Email notifications',
                ]),
                active: true,
            },
            {
                name: 'Pro Plan',
                description: 'Advanced features for growing businesses',
                price: 49.99,
                interval: 'month',
                stripePriceId: 'price_1RFwbXLSgAIRx4qaeFQWntkA',
                features: JSON.stringify([
                    'Up to 10 employees',
                    'Advanced appointment scheduling',
                    'SMS notifications',
                    'Custom branding',
                ]),
                active: true,
            },
            {
                name: 'Enterprise Plan',
                description: 'Full-featured solution for larger organizations',
                price: 99.99,
                interval: 'month',
                stripePriceId: 'price_1RFwbYLSgAIRx4qa4k7Zb0Ln',
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

        // First, check if plans already exist
        for (const plan of plans) {
            const existingPlan = await prisma.subscriptionPlan.findFirst({
                where: { stripePriceId: plan.stripePriceId }
            });

            if (existingPlan) {
                console.log(`Updating plan: ${plan.name}`);
                await prisma.subscriptionPlan.update({
                    where: { id: existingPlan.id },
                    data: plan
                });
            } else {
                console.log(`Creating plan: ${plan.name}`);
                await prisma.subscriptionPlan.create({
                    data: plan
                });
            }
        }

        console.log('Subscription plans created or updated successfully.');

    } catch (error) {
        console.error('Error seeding subscription plans:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
main()
    .then(() => console.log('Done!'))
    .catch(e => console.error(e)); 