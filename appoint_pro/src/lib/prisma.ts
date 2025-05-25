// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Ensure this code only runs on the server
export function ensureServerSide() {
    if (typeof window !== 'undefined') {
        throw new Error('Server-side code cannot be run on the client');
    }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;