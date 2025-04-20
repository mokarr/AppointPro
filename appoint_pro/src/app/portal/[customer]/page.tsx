// app/portal/[customer]/page.tsx

import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { notFound, redirect } from "next/navigation";

import CustomerPortalDashboard from "@/components/dashboard/customer-portal-dashboard";

type Params = Promise<{ customer: string }>;

export default async function CustomerPortalPage({ params }: { params: Params }) {
    const session = await auth();
    const { customer } = await params;

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);
    if (organization.name !== customer) {
        return notFound();
    }

    // We pass session and organization data to the client component
    return (
        <CustomerPortalDashboard
            user={session.user}
            organization={organization}
        />
    );
}


