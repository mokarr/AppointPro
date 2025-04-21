import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <DashboardLayout
            sidebar={<DashboardSidebar />}
        >
            {children}
        </DashboardLayout>
    );
} 