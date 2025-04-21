const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const Stripe = require('stripe');

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Categories for features
const featureCategories = ['sport', 'surface', 'indoor', 'amenities'];

// List of all features by category
const featuresByCategory = {
    sport: ['Tennis', 'Basketball', 'Volleyball', 'Football', 'Badminton', 'Squash', 'Swimming'],
    surface: ['Clay', 'Hard court', 'Grass', 'Artificial grass', 'Carpet', 'Wood'],
    indoor: ['Indoor', 'Outdoor', 'Covered'],
    amenities: ['Changing room', 'Shower', 'Lighting', 'Parking', 'Wheelchair accessible']
};

// Generate a sanitized subdomain from organization name
const generateSubdomainFromName = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')  // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove duplicate hyphens
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};

async function main() {
    try {
        console.log('Starting database seeding...');

        // Create a test organization
        const organizationName = 'SportCenter Pro';
        const organization = await prisma.organization.upsert({
            where: { id: 'test-org' },
            update: {
                subdomain: generateSubdomainFromName(organizationName)
            },
            create: {
                id: 'test-org',
                name: organizationName,
                branche: 'SPORTS',
                description: 'A modern sports center with various facilities',
                subdomain: generateSubdomainFromName(organizationName)
            },
        });

        // Create features
        console.log('Creating features...');
        const createdFeatures = {};

        for (const category of featureCategories) {
            for (const featureName of featuresByCategory[category]) {
                const featureId = `${category}-${featureName.toLowerCase().replace(/\s+/g, '-')}`;

                const feature = await prisma.feature.upsert({
                    where: { id: featureId },
                    update: {},
                    create: {
                        id: featureId,
                        name: featureName,
                        category
                    }
                });

                // Save the ID for later reference
                createdFeatures[featureId] = feature.id;
            }
        }

        // Create locations with facilities
        console.log('Creating locations and facilities...');

        // Amsterdam location
        const amsterdamLocation = await prisma.location.create({
            data: {
                name: 'SportCenter Pro - Amsterdam',
                address: 'Sportlaan 123',
                postalCode: '1234 AB',
                country: 'Netherlands',
                organization: {
                    connect: {
                        id: organization.id
                    }
                },
                facilities: {
                    create: [
                        {
                            name: 'Tennis Court 1',
                            description: 'Professional indoor tennis court',
                            price: 30.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-tennis'] },
                                    { id: createdFeatures['surface-clay'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-lighting'] }
                                ]
                            }
                        },
                        {
                            name: 'Tennis Court 2',
                            description: 'Professional outdoor tennis court',
                            price: 25.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-tennis'] },
                                    { id: createdFeatures['surface-hard-court'] },
                                    { id: createdFeatures['indoor-outdoor'] },
                                    { id: createdFeatures['amenities-lighting'] }
                                ]
                            }
                        },
                        {
                            name: 'Basketball Court',
                            description: 'Full-size basketball court',
                            price: 40.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-basketball'] },
                                    { id: createdFeatures['surface-wood'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-changing-room'] },
                                    { id: createdFeatures['amenities-shower'] }
                                ]
                            }
                        },
                        {
                            name: 'Swimming Pool',
                            description: 'Olympic-size swimming pool',
                            price: 15.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-swimming'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-changing-room'] },
                                    { id: createdFeatures['amenities-shower'] }
                                ]
                            }
                        }
                    ]
                }
            }
        });

        // Utrecht location
        const utrechtLocation = await prisma.location.create({
            data: {
                name: 'SportCenter Pro - Utrecht',
                address: 'Olympialaan 45',
                postalCode: '3543 CC',
                country: 'Netherlands',
                organization: {
                    connect: {
                        id: organization.id
                    }
                },
                facilities: {
                    create: [
                        {
                            name: 'Tennis Court 1',
                            description: 'Indoor tennis court',
                            price: 28.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-tennis'] },
                                    { id: createdFeatures['surface-hard-court'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-lighting'] }
                                ]
                            }
                        },
                        {
                            name: 'Basketball Court',
                            description: 'Full-size basketball court',
                            price: 35.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-basketball'] },
                                    { id: createdFeatures['surface-wood'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-lighting'] },
                                    { id: createdFeatures['amenities-changing-room'] }
                                ]
                            }
                        },
                        {
                            name: 'Multifunctional Sports Hall',
                            description: 'Large hall suitable for various sports',
                            price: 50.00,
                            features: {
                                connect: [
                                    { id: createdFeatures['sport-basketball'] },
                                    { id: createdFeatures['sport-volleyball'] },
                                    { id: createdFeatures['sport-badminton'] },
                                    { id: createdFeatures['surface-wood'] },
                                    { id: createdFeatures['indoor-indoor'] },
                                    { id: createdFeatures['amenities-lighting'] },
                                    { id: createdFeatures['amenities-changing-room'] },
                                    { id: createdFeatures['amenities-shower'] }
                                ]
                            }
                        }
                    ]
                }
            }
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
                description: 'Perfect for small sports facilities',
                price: 49.99,
                interval: 'month',
                features: JSON.stringify([
                    'Up to 3 facilities',
                    'Basic booking system',
                    'Email notifications',
                ]),
                active: true,
            },
            {
                id: 'pro-plan',
                name: 'Pro Plan',
                description: 'Ideal for medium-sized sports centers',
                price: 99.99,
                interval: 'month',
                features: JSON.stringify([
                    'Up to 10 facilities',
                    'Advanced booking system',
                    'SMS notifications',
                    'Analytics dashboard',
                ]),
                active: true,
            },
            {
                id: 'enterprise-plan',
                name: 'Enterprise Plan',
                description: 'For large sports complexes',
                price: 199.99,
                interval: 'month',
                features: JSON.stringify([
                    'Unlimited facilities',
                    'Priority support',
                    'Advanced analytics',
                    'API access',
                    'Custom integrations',
                ]),
                active: true,
            },
        ];

        // Setup Stripe if available
        if (stripe) {
            console.log('Setting up Stripe products and prices...');

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
                plan.stripePriceId = existingPrice.id;
            }
        } else {
            console.log('Stripe integration skipped: STRIPE_SECRET_KEY not found');

            // Use mock Stripe IDs for local development
            plans[0].stripePriceId = 'price_mock_basic';
            plans[1].stripePriceId = 'price_mock_pro';
            plans[2].stripePriceId = 'price_mock_enterprise';
        }

        // Create subscription plans in database
        for (const plan of plans) {
            await prisma.subscriptionPlan.upsert({
                where: { id: plan.id },
                update: plan,
                create: plan,
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