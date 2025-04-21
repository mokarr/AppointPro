# Database Setup Guide for AppointPro

This document explains how to set up, reset, and seed the database for the AppointPro application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Setting Up the Database

### 1. Environment Setup

First, make sure you have a `.env` file with the proper database configuration:

```bash
# Copy the example environment file
cp .env.example .env
```

The default configuration uses SQLite with a local file:

```
DATABASE_URL="file:./dev.db"
```

For Stripe integration (optional):
```
STRIPE_SECRET_KEY="your_stripe_secret_key"
```

### 2. Initialize the Database

Run Prisma migrations to create the database schema:

```bash
# Install dependencies if you haven't already
npm install

# Run migrations to create database tables
npm run db:migrate
```

## Seeding the Database

The application comes with a seeding script that populates the database with initial data (organizations, locations, facilities, features, and a test user).

### Run the Seed Script

```bash
# Run the seed script
npx prisma db seed
```

This will create:

1. A test organization: "SportCenter Pro"
2. Features for facilities, categorized as:
   - Sport types (Tennis, Basketball, etc.)
   - Surface types (Clay, Wood, etc.)
   - Indoor/Outdoor options
   - Amenities (Changing room, Lighting, etc.)
3. Two locations with various facilities:
   - Amsterdam location with 4 facilities
   - Utrecht location with 3 facilities
4. A test user with the email "test@example.com" and password "password123"
5. Subscription plans (with Stripe integration if configured)

## Resetting the Database

If you need to reset the database (drop all tables and recreate them):

```bash
# Reset the database and run migrations
npm run db:reset
```

This command will:
1. Drop all tables
2. Run all migrations to recreate the schema
3. Automatically run the seed script

## Viewing the Database

You can use Prisma Studio to view and edit the database content:

```bash
# Start Prisma Studio
npm run db:studio
```

This will open a web interface at http://localhost:5555 where you can explore and modify your database.

## Troubleshooting

### Permission Issues

If you encounter permission errors when running Prisma commands:

1. Make sure you have write access to the project directory
2. Try running the command with administrator privileges
3. Close any applications that might be using the database file

### Database Reset Fails

If database reset fails:

1. Delete the `dev.db` file manually
2. Run migrations again with `npm run db:migrate`
3. Seed the database with `npx prisma db seed`

## Additional Commands

- Generate Prisma client: `npx prisma generate`
- Create a new migration: `npx prisma migrate dev --name your_migration_name` 