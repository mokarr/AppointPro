import { auth } from "@/lib/auth";
import { getFacilityById } from '@/services/facility';
import { redirect } from "next/navigation";
import FacilitySettingsContent from "./facility-settings-content";

export const metadata = {
    title: "Faciliteiten-instellingen | AppointPro",
    description: "Beheer de instellingen van uw faciliteiten",
};

export default async function FacilitiesSettingsPage({ params }: { params: Promise<{ facilityId: string }> }) {
    const session = await auth();
    const resolvedParams = await params;


    if (!session) {
        redirect("/sign-in");
    }

    const facility = await getFacilityById(resolvedParams.facilityId);

    if (!facility) {
        redirect("/dashboard/facilities");
    }

    return (
        <FacilitySettingsContent
            _user={session.user as any}
            _facility={facility}
        />
    );
} 