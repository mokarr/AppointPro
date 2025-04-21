import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./zod"
import { verifyPassword } from "@/utils/password"
import { db } from "./server"
import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";
import { Adapter, AdapterUser } from "next-auth/adapters";
import type { User, Session } from '@prisma/client'

// Define your custom user type that includes organization
type CustomUser = AdapterUser & {
    organizationId?: string;
    organization?: {
        id: string;
        name: string;
        branche: string;
        description: string;
        updatedAt: Date;
        createdAt: Date;
    };
};

// Create a custom adapter instead of using PrismaAdapter
const customAdapter: Partial<Adapter> = {
    createUser: async (userData: Omit<AdapterUser, "id">) => {
        const user = await db.user.create({
            data: userData as any,
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
    createSession: async (session: any) => {
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
    updateSession: async (session: any) => {
        return db.session.update({
            where: { sessionToken: session.sessionToken },
            data: session,
        });
    },
    deleteSession: async (sessionToken: string) => {
        return db.session.delete({ where: { sessionToken } });
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: customAdapter as Adapter,
    pages: {
        signIn: '/sign-in',
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
            authorize: async (credentials) => {
                try {
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

                    return {
                        id: user.id,
                        email: user.email,
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
                token.user = user as any;
            }

            if (trigger === "update" && session?.user) {
                token.user = { ...token.user as any, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as CustomUser;
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

