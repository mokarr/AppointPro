import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import padel from "../../../../../public/images/padel.jpg"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('signup');
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Add your form submission logic here

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{t('welcome')}</h1>
                <p className="text-muted-foreground text-balance">
                  {t('welcome')}
                </p>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {step === 1 && (
              <>
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
              </>
            )}
            {step === 2 && (
              <>
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
              </>
            )}
            {step === 3 && (
              <>
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
              </>
            )}
            <div className="flex justify-between mt-4">
              {step > 1 && (
                <Button type="button" onClick={prevStep} disabled={isLoading}>
                  {t('previous')}
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} disabled={isLoading}>
                  {t('next')}
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('loading') : t('createAccount')}
                </Button>
              )}
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
    </div>
  );
} 