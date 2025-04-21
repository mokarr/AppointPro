import { notFound } from "next/navigation";
import { db } from "@/lib/server";
import UserLanding from "@/components/landing/UserLanding";

export default async function UserLandingPage({
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
            services: true,
            Employee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    // If organization doesn't exist, show 404
    if (!organization) {
        notFound();
    }

    return <UserLanding organization={organization} />;
} 