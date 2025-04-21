import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { notFound, redirect } from "next/navigation";

import AppointmentsPageContent from "./appointments-page-content";

export default async function AppointmentsPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <AppointmentsPageContent
            user={session.user}
            organization={organization}
        />
    );
} 