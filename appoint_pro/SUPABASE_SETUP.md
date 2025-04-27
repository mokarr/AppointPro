# Supabase Integration Guide

This project has been configured to use Supabase as the database provider. Follow these steps to set up Supabase for both development and production environments.

## Setting Up Supabase

### 1. Create a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project
3. Take note of your project URL and API keys (found in Project Settings > API)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# Supabase connection
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# Other environment variables (NextAuth, Stripe, etc.)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-secret-key-here"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

### 3. Local Development with Supabase

For local development, you can either:

#### Option A: Use Supabase Cloud

Simply configure your `.env` file to point to your Supabase cloud project.

#### Option B: Run Supabase Locally (Recommended for Development)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
3. Initialize Supabase locally:
   ```bash
   supabase init
   supabase start
   ```
4. Update your `.env` file with the local connection details:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
   NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..." # The CLI will output this key
   SUPABASE_SERVICE_ROLE_KEY="eyJh..." # The CLI will output this key
   ```

### 4. Migrate Your Schema to Supabase

Run the Prisma migration to apply your schema to Supabase:

```bash
npx prisma migrate dev --name init
```

You may need to adjust your schema for PostgreSQL compatibility.

### 5. Production Deployment

When deploying to production:

1. Configure your production environment variables with the Supabase cloud project details
2. Run database migrations as part of your deployment process:
   ```bash
   npx prisma migrate deploy
   ```

## Using Supabase in Your Application

### Accessing Supabase Directly (Optional)

For direct access to Supabase features (storage, realtime, etc.), use the Supabase client:

```typescript
import { supabase } from '@/lib/supabase';

// Example: Get data from a table
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### Using Prisma (Recommended)

For most database operations, continue using Prisma as before. The Prisma client is automatically configured to connect to your Supabase PostgreSQL database:

```typescript
import { db } from '@/lib/server';

// Example: Get data using Prisma
const users = await db.user.findMany();
```

## Troubleshooting

If you encounter connection issues:

1. Verify your environment variables are correct
2. Ensure your IP address is allowed in the Supabase project settings
3. Check the database connection with:
   ```typescript
   import { checkDatabaseConnection } from '@/lib/prisma';
   await checkDatabaseConnection();
   ```

For more help, refer to the [Supabase documentation](https://supabase.com/docs) or [Prisma documentation](https://www.prisma.io/docs/). 