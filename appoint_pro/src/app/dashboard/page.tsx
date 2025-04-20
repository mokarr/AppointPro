import { auth } from "@/lib/auth";
import { db } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Calendar, CreditCard } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    // Fetch the user's organization data
    const organization = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
            locations: true,
            Employee: true,
            subscriptions: {
                where: { status: "active" },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!organization) {
        redirect("/sign-in");
    }

    // Get user details with role
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, role: true },
    });

    return (
        <div className="space-y-6">
            <DashboardHeader
                heading={`Welcome, ${user?.name || "User"}`}
                description={`You are logged in as ${user?.role || "CLIENT"}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Organization</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{organization.name}</div>
                        <p className="text-xs text-muted-foreground mt-1">{organization.branche}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/${organization.name}`}>View Organization</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{organization.Employee.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Employees</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/dashboard/employees">View Employees</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Locations</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{organization.locations.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Locations</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/dashboard/locations">View Locations</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {organization.hasActiveSubscription ? "Active" : "Inactive"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {organization.subscriptions.length > 0
                                ? `Plan: ${organization.subscriptions[0].planName}`
                                : "No active subscription"}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="/subscription/plans">Manage Subscription</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Commonly used actions for your organization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button asChild variant="outline">
                            <Link href="/dashboard/appointments/new">Schedule Appointment</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/organizations">Manage Organizations</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/subscription/plans">Upgrade Subscription</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 