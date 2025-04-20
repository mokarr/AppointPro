import { DefaultSession } from "next-auth";
import { Organization } from "@prisma/client";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            email: string;
            organizationId: string;
            organization: Organization;
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        email: string;
        organizationId: string;
        organization: Organization;
    }
}