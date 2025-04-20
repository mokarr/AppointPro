import { syncActiveSubscriptions } from '@/services/stripe-subscription';

/**
 * Script to manually sync all subscriptions with Stripe
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/sync-subscriptions.ts
 */
async function main() {
    try {
        console.log('Starting manual subscription sync with Stripe...');
        await syncActiveSubscriptions();
        console.log('Sync completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing subscriptions:', error);
        process.exit(1);
    }
}

// Run the script
main(); 