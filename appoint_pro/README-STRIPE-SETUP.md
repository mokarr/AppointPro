# Stripe Subscription Integration

This document outlines how Stripe subscriptions have been integrated into the Appoint Pro application.

## Features Implemented

- Subscription management with Stripe
- Database models for subscription tracking
- Middleware for subscription status checking
- Subscription plans page
- Stripe webhook handling
- Customer portal integration

## Setup Instructions

### 1. Environment Variables

Update your `.env` file with your Stripe API keys:

```
# Stripe configuration
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
```

You need to replace the placeholder values with actual keys from your Stripe dashboard.

### 2. Create Products and Prices in Stripe

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Products -> Add Product
3. Create the following products and prices:

   - Basic Plan: $19.99/month
   - Pro Plan: $49.99/month
   - Enterprise Plan: $99.99/month

4. For each product, note the price ID (starts with `price_`)
5. Update the `stripePriceId` values in the `createSubscriptionPlans` function in `src/services/stripe-subscription.ts`

### 3. Initialize Subscription Plans in Database

Run the seeding script to create the plans in your database:

```
npm run db:seed-plans
```

### 4. Set Up Stripe Webhooks

1. Install the Stripe CLI from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run the following command to forward webhook events to your local server:

```
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

3. Copy the webhook signing secret displayed in the terminal
4. Update the `STRIPE_WEBHOOK_SECRET` in your `.env` file

For production, you'll need to configure webhooks in the Stripe Dashboard.

## Testing Subscriptions

### Test Cards

When testing the subscription flow, you can use these Stripe test cards:

- **Success**: 4242 4242 4242 4242
- **Authentication Required**: 4000 0025 0000 3155
- **Decline**: 4000 0000 0000 0002

For all test cards, you can use:
- Any future expiration date
- Any 3-digit CVC
- Any name and address

### Testing the Subscription Flow

1. Go to http://localhost:3000/subscription/plans
2. Select a plan
3. Complete checkout using a test card
4. You'll be redirected back to the application
5. Check the webhook listener terminal to see events being processed

### Subscription Management

After subscribing, users can:
1. View their current subscription in the dashboard
2. Access the Stripe Customer Portal to update payment methods or cancel
3. Change plans through the application interface

## How It Works

1. **Authentication Flow**:
   - When a user logs in, the system checks if their organization has an active subscription
   - Users without an active subscription are redirected to the subscription plans page

2. **Subscription Flow**:
   - Users select a plan from the subscription plans page
   - They are redirected to Stripe Checkout to complete payment
   - After successful payment, they're redirected back to the application
   - Stripe sends a webhook with subscription details
   - The application updates the database with the subscription status

3. **Middleware Protection**:
   - The middleware checks if the current user's organization has an active subscription
   - If not, they are redirected to the subscription plans page
   - Public routes like authentication and subscription management are exempted

4. **Subscription Management**:
   - Users can manage their subscription from the dashboard using the subscription management component
   - The component provides access to the Stripe Customer Portal

## Files Added/Modified

- Database Schema:
  - Added `Subscription`, `SubscriptionPlan` models
  - Updated `Organization` and `User` models

- API Routes:
  - `/api/webhooks/stripe/route.ts` - Handles Stripe webhooks
  - `/api/subscriptions/create-checkout/route.ts` - Creates checkout sessions
  - `/api/subscriptions/create-portal/route.ts` - Creates customer portal sessions

- Pages:
  - `/subscription/plans/page.tsx` - Displays available plans
  - `/subscription/success/page.tsx` - Subscription success page
  - `/subscription/cancel/page.tsx` - Subscription cancellation page

- Components:
  - `/subscription/plans/plan-card.tsx` - Individual plan card component
  - `/components/subscription-management.tsx` - Subscription status component for dashboard

- Services:
  - `/lib/stripe.ts` - Stripe client
  - `/services/stripe-subscription.ts` - Subscription management functions

- Middleware:
  - `/middleware.ts` - Checks subscription status

## Troubleshooting

### Webhook Issues
- Ensure the webhook secret is correctly set in your `.env` file
- Check that your webhook listener is running
- Verify that your application is running on port 3000

### Subscription Not Active
- Check webhook listener for errors
- Verify the subscription was created in Stripe dashboard
- Ensure your database is properly updated

## Next Steps

1. Include the `SubscriptionManagement` component in your dashboard page
2. Create actual products and prices in your Stripe account
3. Update the price IDs in your code
4. Test the subscription flow end-to-end
5. Set up production webhooks when deploying to production

## Automated Setup

To automate the setup process, use the provided scripts:

1. Run the setup script first:
   ```powershell
   .\setup-stripe-environment.ps1
   ```

2. After setting up, run the update script:
   ```powershell
   .\update-stripe-plan-ids.ps1
   ```

3. Initialize your database:
   ```powershell
   npm run db:seed-plans
   ```

These scripts will automate all the steps outlined in your README-STRIPE-SETUP.md file, making the setup process faster and more reliable.