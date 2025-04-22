import { DefaultSession } from "next-auth";
import { User as PrismaUser, Organization } from "@prisma/client";

/**
 * Extended types for NextAuth.js
 */
declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string;
            email: string;
            organizationId: string;
            organization: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                subdomain: string | null;
                branche: string;
                stripeCustomerId: string | null;
                hasActiveSubscription: boolean;
            };
            role?: string;
        } & DefaultSession["user"]
    }

    /**
     * Extend the built-in user types
     */
    interface User extends PrismaUser {
        organization?: Organization;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        user?: {
            id: string;
            email: string;
            organizationId: string;
            organization: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                subdomain: string | null;
                branche: string;
                stripeCustomerId: string | null;
                hasActiveSubscription: boolean;
            };
            role?: string;
        };
    }
}