import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
    LayoutDashboard,
    Building,
    Users,
    Calendar,
    Settings,
    BarChart,
    CreditCard
} from "lucide-react";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    return (
        <DashboardLayout
            header={
                <header className="h-16 border-b flex items-center px-6">
                    <div className="flex-1">
                        <Link href="/dashboard" className="text-xl font-bold">
                            AppointPro
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <Link href="/dashboard/profile" className="text-sm font-medium">
                            Profile
                        </Link>
                        <Link href="/api/auth/signout" className="text-sm font-medium">
                            Sign Out
                        </Link>
                    </nav>
                </header>
            }
            sidebar={
                <div className="p-4">
                    <nav className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>

                        <Link
                            href="/dashboard/organizations"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <Building className="h-4 w-4" />
                            <span className="text-sm font-medium">Organizations</span>
                        </Link>

                        <Link
                            href="/dashboard/customers"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Customers</span>
                        </Link>

                        <Link
                            href="/dashboard/appointments"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">Appointments</span>
                        </Link>

                        <Link
                            href="/dashboard/analytics"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <BarChart className="h-4 w-4" />
                            <span className="text-sm font-medium">Analytics</span>
                        </Link>

                        <Link
                            href="/subscription/plans"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <CreditCard className="h-4 w-4" />
                            <span className="text-sm font-medium">Subscription</span>
                        </Link>

                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </nav>
                </div>
            }
        >
            {children}
        </DashboardLayout>
    );
} 