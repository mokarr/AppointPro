import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function SignInPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 md:p-6">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
      )
}
