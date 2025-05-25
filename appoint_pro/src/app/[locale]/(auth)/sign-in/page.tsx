import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    if (session) redirect("/dashboard");

    const emailConfirmed = (await searchParams).emailconfirmed === 'true';
    const emailSent = (await searchParams).emailSent === 'true';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 md:p-6">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm emailConfirmed={emailConfirmed} emailSent={emailSent} />
            </div>
        </div>
    );
}
