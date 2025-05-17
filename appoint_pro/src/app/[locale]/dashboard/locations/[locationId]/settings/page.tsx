import { auth } from "@/lib/auth";
import { getLocationById } from "@/services/location";
import { redirect } from "next/navigation";
import LocationSettingsContent from "@/app/[locale]/dashboard/locations/[locationId]/settings/location-settings-content"

export const metadata = {
    title: "Locatie-instellingen | AppointPro",
    description: "Beheer de instellingen van uw locatie",
};

export default async function LocationSettingsPage({ params }: { params: Promise<{ locationId: string }> }) {
    const session = await auth();
    const resolvedParams = await params;

    if (!session) {
        redirect("/sign-in");
    }

    const location = await getLocationById(resolvedParams.locationId);

    if (!location) {
        redirect("/dashboard/locations");
    }

    return (
        <LocationSettingsContent
            _user={session.user as any}
            _location={location as any}//TODO: fix this
        />
    );
} 