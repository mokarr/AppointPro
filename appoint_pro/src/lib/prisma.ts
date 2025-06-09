// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Ensure this code only runs on the server
export function ensureServerSide() {
    if (typeof window !== 'undefined') {
        throw new Error('Server-side code cannot be run on the client');
    }
}

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}