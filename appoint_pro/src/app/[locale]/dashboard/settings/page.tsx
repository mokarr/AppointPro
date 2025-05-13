import { auth } from "@/lib/auth";
import { getOrganizationById } from "@/services/organization";
import { redirect } from "next/navigation";
import SettingsPageContent from "./settings-page-content";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const organization = await getOrganizationById(session.user.organizationId);

    return (
        <SettingsPageContent
            _user={session.user}
        />
    );
}
