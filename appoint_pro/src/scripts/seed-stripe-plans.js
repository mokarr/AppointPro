import { createSubscriptionPlans } from '@/services/stripe-subscription';

/**
 * Script to seed the database with subscription plans
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/seed-stripe-plans.js
 */
async function main() {
    try {
        console.log('Creating subscription plans in database...');
        await createSubscriptionPlans();
        console.log('Subscription plans created successfully.');

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding subscription plans:', error);
        process.exit(1);
    }
}

// Run the script
main(); 