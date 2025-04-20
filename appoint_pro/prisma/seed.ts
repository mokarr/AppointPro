import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

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

        // Create subscription plans
        const plans = [
            {
                id: 'basic-plan',
                name: 'Basic Plan',
                description: 'Access to basic appointment scheduling features',
                price: 19.99,
                interval: 'month',
                stripePriceId: 'price_1RFwmaLSgAIRx4qai7dlRJMn',
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
                stripePriceId: 'price_1RFwmaLSgAIRx4qai7dlRJMn',
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
                stripePriceId: 'price_1RFwmaLSgAIRx4qa55p0cZ61',
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

        for (const plan of plans) {
            await prisma.subscriptionPlan.upsert({
                where: { id: plan.id },
                update: plan,
                create: plan,
            });
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