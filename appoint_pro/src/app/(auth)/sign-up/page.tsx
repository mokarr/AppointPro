'use client';

import { signInAfterSignUp, signUp } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignUpPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setIsLoading(true);

        try {
            // Stap 1: Registreer de gebruiker
            const res = await signUp(formData);

            if (res.success && res.data?.organizationName) {
                // Stap 2: Log direct in met de gegevens
                const signInFormData = new FormData();
                signInFormData.append("email", formData.get("email") as string);
                signInFormData.append("password", formData.get("password") as string);
                signInFormData.append("organizationName", res.data.organizationName);

                // Gebruik server action om in te loggen
                await signInAfterSignUp(signInFormData);

                // Redirect naar portal
                router.push(`/portal/${res.data.organizationName}`);
            } else {
                setError(res.message || "Er is een fout opgetreden. Organisatienaam ontbreekt.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Er is een fout opgetreden bij het registreren");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center mb-6">Account Aanmaken</h1>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">
                        Vul uw gegevens in
                    </span>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form className="space-y-4" action={handleSubmit}>
                <Input
                    name="name"
                    placeholder="Bedrijfsnaam"
                    type="text"
                    required
                    autoComplete="organization"
                    aria-label="Bedrijfsnaam"
                />
                <Input
                    name="branche"
                    placeholder="Branche"
                    type="text"
                    required
                    aria-label="Branche"
                />
                <Input
                    name="address"
                    placeholder="Adres"
                    type="text"
                    required
                    autoComplete="address-line1"
                    aria-label="Adres"
                />
                <Input
                    name="postalcode"
                    placeholder="Postcode"
                    type="text"
                    required
                    autoComplete="postal-code"
                    pattern="[1-9][0-9]{3}\s?[a-zA-Z]{2}"
                    title="Vul een geldige postcode in (bijv. 1234 AB)"
                    aria-label="Postcode"
                />
                <Input
                    name="country"
                    placeholder="Land"
                    type="text"
                    required
                    autoComplete="country"
                    defaultValue="Nederland"
                    aria-label="Land"
                />
                <Input
                    name="email"
                    placeholder="E-mailadres"
                    type="email"
                    required
                    autoComplete="email"
                    aria-label="E-mailadres"
                />
                <Input
                    name="password"
                    placeholder="Wachtwoord"
                    type="password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    aria-label="Wachtwoord"
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? 'Bezig met registreren...' : 'Account Aanmaken'}
                </Button>
            </form>

            <div className="text-center">
                <Button asChild variant="link">
                    <Link href="/sign-in">Al een account? Log hier in</Link>
                </Button>
            </div>
        </div>
    );
};

export default SignUpPage;