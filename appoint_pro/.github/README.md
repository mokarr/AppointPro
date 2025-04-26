# GitHub CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the AppointPro application.

## Workflows

### Build and Test (`build-test.yml`)

This workflow runs on all branch pushes (except main) and pull requests to the main branch. It:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Runs the linter
5. Generates the Prisma client
6. Builds the Next.js application
7. Runs component tests
8. Runs Cypress end-to-end tests

### Deploy (`deploy.yml`)

This workflow runs whenever changes are pushed to the main branch. It:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Generates the Prisma client
5. Builds the Next.js application
6. Applies database migrations
7. Deploys to Vercel
8. Syncs Stripe subscriptions if needed

## Required Secrets

The following secrets need to be configured in your GitHub repository settings:

- `DATABASE_URL`: URL for your PostgreSQL database
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: URL for NextAuth.js in production
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## Setup Instructions

1. Go to your GitHub repository settings
2. Navigate to Secrets > Actions
3. Add all the required secrets listed above
4. Create an environment named "production" for production-specific secrets

## Manual Deployment

You can also trigger a deployment manually by going to the Actions tab in GitHub and selecting the Deploy workflow, then clicking "Run workflow". 