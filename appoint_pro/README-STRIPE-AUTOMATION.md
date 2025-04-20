# Stripe Integration Automation Scripts

This folder contains PowerShell scripts that automate the setup of Stripe for AppointPro.

## Overview

The scripts handle the following tasks:
- Setting up the Stripe development environment
- Installing required dependencies
- Creating products and prices in Stripe
- Updating environment variables
- Setting up webhook forwarding
- Updating the codebase with the correct Stripe price IDs

## Scripts

### 1. `setup-stripe-environment.ps1`

This script handles the initial setup of your Stripe development environment:

- Checks for Node.js installation
- Verifies and updates necessary environment variables in `.env`
- Installs the Stripe CLI if needed
- Installs the Stripe Node.js SDK if needed
- Authenticates with Stripe using the CLI
- Creates the necessary products and prices in Stripe
- Saves the product/price IDs for reference
- Sets up webhook forwarding to your local development server

#### Usage

```powershell
.\setup-stripe-environment.ps1
```

### 2. `update-stripe-plan-ids.ps1`

This script updates your codebase with the Stripe price IDs created by the setup script:

- Reads the price IDs from the file created by `setup-stripe-environment.ps1`
- Updates the `src/services/stripe-subscription.ts` file with the correct price IDs
- Creates a backup of the original file before making changes
- Verifies the changes were applied correctly

#### Usage

```powershell
.\update-stripe-plan-ids.ps1
```

## Complete Setup Process

1. Run the setup script to create Stripe products and set up your environment:
   ```powershell
   .\setup-stripe-environment.ps1
   ```

2. When prompted, enter your Stripe API keys from the Stripe Dashboard.

3. After the setup completes and webhook forwarding is active, copy the webhook signing secret and update the `.env` file.

4. Run the update script to update your codebase with the Stripe price IDs:
   ```powershell
   .\update-stripe-plan-ids.ps1
   ```

5. Initialize the database with the subscription plans:
   ```powershell
   npm run db:seed-plans
   ```

6. Start your development server:
   ```powershell
   npm run dev
   ```

## Troubleshooting

- **Stripe CLI installation fails**: You may need to manually download and install the Stripe CLI from the [GitHub releases page](https://github.com/stripe/stripe-cli/releases/latest).
  
- **Price IDs not updated**: If the automatic update fails, you can manually update the `stripePriceId` values in `src/services/stripe-subscription.ts` using the IDs saved in `stripe-price-ids.txt`.

- **Webhook errors**: Ensure your Next.js server is running on port 3000 before starting the webhook forwarding.

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node) 