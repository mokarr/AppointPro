import { PrismaClient } from "@prisma/client";

// PrismaClient for scripts (doesn't use server-only restrictions)
const prismaClient = new PrismaClient({
    log: ["error"],
});

export { prismaClient as prisma }; 