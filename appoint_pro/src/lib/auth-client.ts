'use client';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

type SignInCredentials = {
    redirect?: boolean;
    redirectTo?: string;
    [key: string]: unknown;
};

// Client-safe versions of auth functions
export const signIn = async (provider: string, credentials: SignInCredentials) => {
    return nextAuthSignIn(provider, {
        ...credentials,
        redirect: credentials.redirect !== undefined ? credentials.redirect : false,
        redirectTo: credentials.redirectTo || undefined
    });
};

export const signOut = async () => {
    return nextAuthSignOut({ redirect: true });
}; 