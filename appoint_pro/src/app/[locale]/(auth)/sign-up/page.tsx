'use client';

import { signInAfterSignUp, signUp } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignUpForm } from "@/app/[locale]/(auth)/sign-up/signUp-form"

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
                router.push(`/dashboard`);
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
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <SignUpForm />
            </div>
        </div>
    );
};

export default SignUpPage;