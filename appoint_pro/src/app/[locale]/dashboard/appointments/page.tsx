import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { redirect } from "next/navigation";

import AppointmentsPageContent from "@/app/[locale]/dashboard/appointments/appointments-page-content";

export default async function AppointmentsPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <AppointmentsPageContent
            _user={session.user}
            _organization={organization}
        />
    );
} 