import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { redirect } from "next/navigation";

import OrganizationsPageContent from "@/app/dashboard/organizations/organizations-page-content";

export default async function OrganizationsPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <OrganizationsPageContent
            user={session.user}
            organization={organization}
        />
    );
} 