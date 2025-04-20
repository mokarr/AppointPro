import { auth } from "@/lib/auth";
import { db } from "@/lib/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building, Users, MapPin } from "lucide-react";

export default async function OrganizationsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/sign-in");
    }

    // Fetch the user's organization
    const userOrganization = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
            locations: true,
            Employee: true,
        },
    });

    if (!userOrganization) {
        notFound();
    }

    // Get the user with role information
    const userWithRole = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    // Check if user is admin
    const isAdmin = userWithRole?.role === "ADMIN";

    // If user is ADMIN, fetch all organizations
    const allOrganizations = isAdmin
        ? await db.organization.findMany({
            include: {
                locations: true,
                Employee: true,
                User: true,
            },
            orderBy: {
                name: "asc",
            },
        })
        : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">My Organization</h2>
                    <OrganizationCard organization={userOrganization} isCurrentOrg={true} />
                </div>

                {isAdmin && allOrganizations.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">All Organizations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allOrganizations.map((org) => (
                                <OrganizationCard
                                    key={org.id}
                                    organization={org}
                                    isCurrentOrg={org.id === userOrganization.id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface OrganizationCardProps {
    organization: any;
    isCurrentOrg: boolean;
}

function OrganizationCard({ organization, isCurrentOrg }: OrganizationCardProps) {
    return (
        <Card className={isCurrentOrg ? "border-primary" : ""}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{organization.name}</CardTitle>
                        <CardDescription>{organization.branche}</CardDescription>
                    </div>
                    {isCurrentOrg && (
                        <div className="flex items-center text-primary text-sm font-medium">
                            <Shield className="h-4 w-4 mr-1" />
                            <span>Current</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm">{organization.description}</p>

                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{organization.Employee.length} employees</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{organization.locations.length} locations</span>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-1" />
                        <span>Created {new Date(organization.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/${organization.name}`}>
                        View Organization
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
} 