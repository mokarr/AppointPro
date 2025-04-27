// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        // You can add additional configuration for Supabase connection if needed
        // For example, connection pooling settings
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export a function to check if code is running on server side
export function ensureServerSide() {
    if (typeof window !== "undefined") {
        throw new Error(
            "This code can only be executed on the server side. Please use Server Components or Server Actions."
        );
    }
}

// Utility function to help with database migrations and setup
export async function checkDatabaseConnection() {
    try {
        // Try to run a simple query to check the connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}