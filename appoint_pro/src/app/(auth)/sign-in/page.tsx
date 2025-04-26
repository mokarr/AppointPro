import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientSignInForm from "@/app/(auth)/sign-in/client-form";

export default async function SignInPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return <ClientSignInForm />;
}
