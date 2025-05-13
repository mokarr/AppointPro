import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"
import { verifyPassword } from "@/utils/password"
import { db } from "@/lib/server"
import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { Session } from "@prisma/client";

// Session data type
type SessionData = {
    sessionToken: string;
    userId: string;
    expires: Date;
};

// Create a custom adapter instead of using PrismaAdapter
const customAdapter: Partial<Adapter> = {
    createUser: async (userData: Omit<AdapterUser, "id">) => {
        // Cast to unknown first to avoid type checking issues
        const user = await db.user.create({
            // @ts-expect-error - Ignore type checking for adapter compatibility
            data: userData,
            include: { organization: true }
        });
        return user as unknown as AdapterUser;
    },
    getUser: async (id: string) => {
        const user = await db.user.findUnique({
            where: { id },
            include: { organization: true }
        });
        return user as unknown as AdapterUser;
    },
    getUserByEmail: async (email: string) => {
        const user = await db.user.findUnique({
            where: { email },
            include: { organization: true }
        });
        return user as unknown as AdapterUser;
    },
    createSession: async (session: SessionData) => {
        return db.session.create({ data: session });
    },
    getSessionAndUser: async (sessionToken: string) => {
        const session = await db.session.findUnique({
            where: { sessionToken },
            include: { user: { include: { organization: true } } },
        });
        if (!session) return null;
        return {
            session,
            user: session.user as unknown as AdapterUser,
        };
    },
    updateSession: async (session: Partial<Session> & { sessionToken: string }) => {
        return db.session.update({
            where: { sessionToken: session.sessionToken },
            data: session,
        });
    },
    deleteSession: async (sessionToken: string) => {
        return db.session.delete({ where: { sessionToken } });
    },
};

type UserWithOrg = AdapterUser & {
    id: string;
    email: string;
    organizationId: string;
    organization: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        subdomain: string | null;
        branche: string;
        description: string;
        stripeCustomerId: string | null;
        hasActiveSubscription: boolean;
    };
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    adapter: customAdapter as Adapter,
    pages: {
        signIn: '/sign-in', //TODO: change to /sign-in?emailconfirmed=true when the email is confirmed
        error: '/sign-in',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            // @ts-expect-error - TypeScript doesn't understand our custom user type
            authorize: async (credentials, _request) => {
                try {
                    //dont need to validate the credentials here, because the zod schema is already validating the credentials in the auth-actions.ts file
                    const { email, password } = await signInSchema.parseAsync(credentials)

                    const user = await db.user.findFirst({
                        where: {
                            email: email.toLowerCase(),
                        },
                        include: {
                            organization: true,
                        }
                    });

                    if (!user || !user.password) {
                        throw new Error("E-mailadres of wachtwoord is onjuist");
                    }

                    const isPasswordValid = await verifyPassword(password, user.password);

                    if (!isPasswordValid) {
                        throw new Error("E-mailadres of wachtwoord is onjuist");
                    }

                    if (!user.active) {
                        throw new Error("Account is nog niet geactiveerd");
                    }

                    // Return the user with the correct shape
                    return {
                        id: user.id,
                        email: user.email,
                        emailVerified: user.emailVerified,
                        name: user.name,
                        image: user.image,
                        organizationId: user.organizationId,
                        organization: user.organization,
                    };
                } catch (error) {
                    throw new Error(error instanceof Error ? error.message : "Er is een fout opgetreden bij het inloggen");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.user = user;
            }

            if (trigger === "update" && session?.user) {
                const updatedUser = session.user as UserWithOrg;
                token.user = {
                    ...(token.user as UserWithOrg),
                    ...updatedUser,
                    id: updatedUser.id,
                    email: updatedUser.email,
                    organizationId: updatedUser.organizationId,
                    organization: updatedUser.organization
                } as UserWithOrg;
            }

            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as UserWithOrg;
            }
            return session;
        },
    },
    jwt: {
        encode: async function (params) {
            if (params.token?.credentials) {
                const sessionToken = uuid();

                if (!params.token.sub) {
                    throw new Error("Geen gebruikers-ID gevonden");
                }

                const createdSession = await customAdapter?.createSession?.({
                    sessionToken: sessionToken,
                    userId: params.token.sub,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                });

                if (!createdSession) {
                    throw new Error("Sessie aanmaken mislukt");
                }

                return sessionToken;
            }
            return defaultEncode(params);
        },
    },
});

