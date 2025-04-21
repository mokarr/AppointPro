import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { notFound, redirect } from "next/navigation";

import CustomersPageContent from "./customers-page-content";

export default async function CustomersPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <CustomersPageContent
            user={session.user}
            organization={organization}
        />
    );
} 