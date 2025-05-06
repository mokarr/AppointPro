import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { redirect } from "next/navigation";

import CustomersPageContent from "@/app/[locale]/dashboard/customers/customers-page-content";

export default async function CustomersPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <CustomersPageContent
            _user={session.user}
            _organization={organization}
        />
    );
} 