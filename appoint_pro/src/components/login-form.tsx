'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import padel from "../../public/images/padel.jpg"
import { authenticate } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface LoginFormProps extends React.ComponentProps<"div"> {
    emailConfirmed?: boolean;
}

export function LoginForm({
    className,
    emailConfirmed,
    ...props
}: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('login');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await authenticate(formData);

            if (!result.success) {
                setError(t('passwordOrEmailIncorrect'));
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            setError(t('error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">{t('welcomeBack')}</h1>
                                <p className="text-muted-foreground text-balance">
                                    {t('welcome')}
                                </p>
                            </div>
                            
                            {emailConfirmed && (
                                <Alert className="bg-green-50 text-green-800 border-green-200">
                                    <AlertDescription>
                                        Uw e-mailadres is bevestigd! U kunt nu inloggen.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="grid gap-3">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{t('password')}</Label>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        {t('forgotPassword')}
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? t('loading') : t('login')}
                            </Button>
                            <div className="text-center text-sm">
                                {t('noAccount') + ' '}
                                <a href="/sign-up" className="underline underline-offset-4">
                                    {t('signUp')}
                                </a>
                            </div>
                        </div>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src={padel.src}
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                {t.rich('termsOfService', {
                    termsLink: (chunks) => <a href="/terms">{chunks}</a>,
                    privacyLink: (chunks) => <a href="/privacy">{chunks}</a>
                })}
            </div>
        </div>
    );
}
