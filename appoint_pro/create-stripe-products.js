import Stripe from 'stripe';
import fs from 'fs';

// Initialize Stripe with the secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createProductsAndPrices() {
    try {
        console.log('Creating Stripe products and prices...');

        // Define the plans in EUR
        const plans = [
            {
                name: 'Basic Plan',
                description: 'Access to basic appointment scheduling features',
                price: 19.99,
                interval: 'month',
            },
            {
                name: 'Pro Plan',
                description: 'Advanced features for growing businesses',
                price: 49.99,
                interval: 'month',
            },
            {
                name: 'Enterprise Plan',
                description: 'Full-featured solution for larger organizations',
                price: 99.99,
                interval: 'month',
            }
        ];

        // Object to store product and price IDs
        const results = {};

        // Create products and prices
        for (const plan of plans) {
            console.log(`Creating product: ${plan.name}...`);

            // Create product
            const product = await stripe.products.create({
                name: plan.name,
                description: plan.description,
            });

            console.log(`Created product: ${plan.name} with ID: ${product.id}`);

            // Create price in EUR
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(plan.price * 100), // Convert euros to cents
                currency: 'eur',
                recurring: {
                    interval: plan.interval,
                },
            });

            console.log(`Created price with ID: ${price.id}`);

            results[plan.name] = {
                productId: product.id,
                priceId: price.id,
            };
        }

        // Write results to file
        const priceIdsFile = 'stripe-price-ids.txt';
        let fileContent = '';

        for (const [planName, ids] of Object.entries(results)) {
            fileContent += `${planName}: ${ids.priceId}\n`;
        }

        fs.writeFileSync(priceIdsFile, fileContent);
        console.log(`Price IDs have been saved to ${priceIdsFile}`);

        console.log('\n======= NEXT STEPS =======');
        console.log(`1. Update your src/services/stripe-subscription.ts file with the price IDs from ${priceIdsFile}`);
        console.log('2. Run \'npm run db:seed-plans\' to initialize subscription plans in your database');
        console.log('3. Start your Next.js development server with \'npm run dev\'');
        console.log('==========================');

    } catch (error) {
        console.error('Error creating products and prices:', error);
    }
}

// Run the function
createProductsAndPrices(); 