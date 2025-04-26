'use server';

import { saltAndHashPassword } from "@/utils/password";
import { executeAction } from "@/lib/executeAction";
import { db } from "@/lib/server";  // Import from server-only module
import { signUpSchema } from "@/lib/zod";
import { signIn } from "@/lib/auth";  // Import auth en signIn

// Generate a sanitized subdomain from organization name
const generateSubdomainFromName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')  // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove duplicate hyphens
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};

const signUp = async (formData: FormData) => {
    return executeAction(
        {
            actionFn: async () => {
                try {
                    const email = formData.get("email") as string;
                    const password = formData.get("password") as string;
                    const name = formData.get("name") as string;
                    const branche = formData.get("branche") as string;
                    const address = formData.get("address") as string;
                    const postalcode = formData.get("postalcode") as string;
                    const country = formData.get("country") as string;

                    const locationName = "Hoofdlocatie";

                    const validatedData = await signUpSchema.parseAsync({
                        email,
                        password,
                        name,
                        branche,
                        address,
                        postalcode,
                        country
                    });

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
                                    name: locationName,
                                    address: validatedData.address,
                                    postalCode: validatedData.postalcode,
                                    country: validatedData.country,
                                },
                            },
                        },
                    });

                    // Maak de gebruiker aan
                    await db.user.create({
                        data: {
                            email: validatedData.email.toLowerCase(),
                            password: pwHash,
                            organizationId: organization.id,
                            role: 'ADMIN',
                        },
                    });

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
const signInAfterSignUp = async (formData: FormData) => {
    try {
        // Log de gebruiker in met credentials
        await signIn("credentials", {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
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
