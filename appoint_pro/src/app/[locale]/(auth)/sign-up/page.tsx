'use client';

import { signInAfterSignUp, signUp } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignUpForm } from "@/app/[locale]/(auth)/sign-up/signUp-form"
import { SignUpData } from "@/models/SignUpData";

const SignUpPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: SignUpData) => {
        setError(null);
        setIsLoading(true);

        try {
            // Stap 1: Registreer de gebruiker
            const res = await signUp(data);

            if (res.success) {
                router.push(`/sign-in`);
            } else {
                setError(res.message || "Er is een fout opgetreden bij het registreren");
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
                <SignUpForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default SignUpPage;