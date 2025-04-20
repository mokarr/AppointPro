import { notFound } from "next/navigation";
import { db } from "@/lib/server";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrganizationPage({
    params,
}: {
    params: { organization: string };
}) {
    // Check if organization exists
    const organization = await db.organization.findFirst({
        where: {
            name: params.organization
        },
        include: {
            locations: true,
            Employee: true
        }
    });

    // If organization doesn't exist, show 404
    if (!organization) {
        notFound();
    }

    // Get the current user's session
    const session = await auth();

    // If user isn't authenticated, they shouldn't reach this page (handled by middleware)
    // But as an extra protection, check again
    if (!session?.user) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="mb-6">You need to be logged in to view this organization.</p>
                <Button asChild>
                    <Link href="/sign-in">Sign In</Link>
                </Button>
            </div>
        );
    }

    // Check if user belongs to this organization (should be handled by middleware)
    // This is a secondary check for extra protection
    if (session.user.organizationId !== organization.id) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="mb-6">You don't have permission to view this organization.</p>
                <Button asChild>
                    <Link href="/dashboard">Go to Your Dashboard</Link>
                </Button>
            </div>
        );
    }

    // User is authenticated and has access to this organization
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">{organization.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                        <dt className="font-medium text-gray-500 dark:text-gray-400">Branch:</dt>
                        <dd>{organization.branche}</dd>
                        <dt className="font-medium text-gray-500 dark:text-gray-400">Description:</dt>
                        <dd>{organization.description}</dd>
                        <dt className="font-medium text-gray-500 dark:text-gray-400">Created:</dt>
                        <dd>{organization.createdAt.toLocaleDateString()}</dd>
                    </dl>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Locations</h2>
                    {organization.locations.length > 0 ? (
                        <ul className="space-y-2">
                            {organization.locations.map((location) => (
                                <li key={location.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                    <div className="font-medium">{location.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{location.address}</div>
                                    {location.postalCode && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {location.postalCode}, {location.country || 'N/A'}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No locations found</p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Employees</h2>
                {organization.Employee.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {organization.Employee.map((employee) => (
                                    <tr key={employee.id} className="border-t dark:border-gray-700">
                                        <td className="p-3">{employee.name}</td>
                                        <td className="p-3">{employee.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No employees found</p>
                )}
            </div>

            <div className="mt-8 flex justify-end">
                <Button asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
