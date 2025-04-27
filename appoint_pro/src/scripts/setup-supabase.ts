/**
 * Supabase Setup Helper Script
 * 
 * This script helps with:
 * 1. Checking Supabase connection
 * 2. Creating initial database schemas
 * 3. Seeding initial data if needed
 * 
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/setup-supabase.ts
 */

import { prisma, checkDatabaseConnection } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";

async function main() {
    console.log("📊 Checking database connection...");

    const isConnected = await checkDatabaseConnection();

    if (!isConnected) {
        console.error("❌ Failed to connect to the database. Please check your DATABASE_URL.");
        process.exit(1);
    }

    console.log("✅ Database connection successful!");

    // Check Supabase connection
    try {
        console.log("🔄 Checking Supabase connection...");
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);

        if (error) throw error;

        console.log("✅ Supabase connection successful!");
    } catch (error) {
        console.warn("⚠️ Supabase direct access check failed, but this might be expected if tables don't exist yet.");
        console.warn("   Prisma will create necessary tables on first migration.");
    }

    // Count Users to check if database has content
    try {
        const userCount = await prisma.user.count();
        console.log(`ℹ️ Found ${userCount} users in the database.`);

        if (userCount === 0) {
            console.log("ℹ️ No users found. You may want to run database seeding.");
            console.log("   Run: npx prisma db seed");
        }
    } catch (error) {
        console.warn("⚠️ Could not check user count. Tables might not exist yet.");
        console.warn("   Run: npx prisma migrate dev --name init");
    }

    console.log("\n📋 Next steps:");
    console.log("1. If tables don't exist: npx prisma migrate dev --name init");
    console.log("2. To seed the database: npx prisma db seed");
    console.log("3. Start your application: npm run dev");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    }); 