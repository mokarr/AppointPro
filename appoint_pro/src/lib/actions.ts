'use server';

import { saltAndHashPassword } from "@/utils/password";
import { executeAction } from "@/lib/executeAction";
import { db } from "@/lib/server";  // Import from server-only module
import { signUpSchema } from "@/lib/zod";
import { signIn } from "@/lib/auth";  // Import auth en signIn
import { randomUUID } from "crypto";
import { sendActivateAccountEmail } from "@/services/email";
import { SignUpData } from "@/models/SignUpData";

// Generate a sanitized subdomain from organization name
const generateSubdomainFromName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')  // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove duplicate hyphens
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};

const signUp = async (data: SignUpData) => {
    return executeAction(
        {
            actionFn: async () => {
                try {
                    const validatedData = await signUpSchema.parseAsync(data);

                    const pwHash = await saltAndHashPassword(validatedData.password);

                    // Generate subdomain from organization name
                    const subdomain = generateSubdomainFromName(validatedData.name);

                    // Check if subdomain is already in use
                    const existingOrg = await db.organization.findFirst({
                        where: { subdomain }
                    });

                    // If subdomain is taken, add a random suffix
                    const finalSubdomain = existingOrg
                        ? `${subdomain}-${Math.floor(1000 + Math.random() * 9000)}`
                        : subdomain;

                    const organization = await db.organization.create({
                        data: {
                            name: validatedData.name,
                            branche: validatedData.branche,
                            description: validatedData.branche,
                            subdomain: finalSubdomain,
                            locations: {
                                create: {
                                    name: "Hoofdlocatie",
                                    address: validatedData.address,
                                    postalCode: validatedData.postalcode,
                                    country: validatedData.country,
                                },
                            },
                        },
                    });

                    // Maak de gebruiker aan
                   const user = await db.user.create({
                        data: {
                            email: validatedData.email.toLowerCase(),
                            password: pwHash,
                            organizationId: organization.id,
                            role: 'ADMIN',
                        },
                    });

                    // Maak een activate token aan
                    const activateToken = await db.activateToken.create({
                        data: {
                            token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ''),
                            userId: user.id,
                        },
                    });

                    // Send activate account email
                    await sendActivateAccountEmail(validatedData.email, activateToken.token, organization.name);

                    // Stuur gegevens terug voor client-side redirect
                    return {
                        organizationId: organization.id,
                        organizationName: organization.name,
                        email: validatedData.email.toLowerCase(),
                    };
                } catch (error) {
                    throw new Error(
                        error instanceof Error
                            ? error.message
                            : "Er is een fout opgetreden bij het registreren"
                    );
                }
            },
            successMessage: "Account succesvol aangemaakt!",
        }
    )
}

// Nieuwe functie om in te loggen na registratie
const signInAfterSignUp = async (data: SignUpData) => {
    try {
        // Log de gebruiker in met credentials
        await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: true,
            redirectTo: `/dashboard`,
        });

        return { success: true };
    } catch (error) {
        console.error("Inloggen na registratie mislukt:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Er is een fout opgetreden bij het inloggen"
        };
    }
}

export { signUp, signInAfterSignUp, generateSubdomainFromName };
