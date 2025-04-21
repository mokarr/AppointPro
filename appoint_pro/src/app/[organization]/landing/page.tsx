import { notFound } from "next/navigation";
import { db } from "@/lib/server";
import OrganizationLanding from "@/components/landing/OrganizationLanding";

export default async function OrganizationLandingPage({
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
        }
    });

    // If organization doesn't exist, show 404
    if (!organization) {
        notFound();
    }

    return <OrganizationLanding organization={organization} />;
} 