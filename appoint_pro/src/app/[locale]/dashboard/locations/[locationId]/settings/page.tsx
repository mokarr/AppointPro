import { auth } from "@/lib/auth";
import { getLocationById } from "@/services/location";
import { redirect } from "next/navigation";
import LocationSettingsContent from "@/app/[locale]/dashboard/locations/[locationId]/settings/location-settings-content"

export const metadata = {
    title: "Locatie-instellingen | AppointPro",
    description: "Beheer de instellingen van uw locatie",
};

export default async function LocationSettingsPage({ params }: { params: { locationId: string } }) {
    const session = await auth();

    if (!session) {
        redirect("/sign-in");
    }

    const location = await getLocationById(params.locationId);

    if (!location) {
        redirect("/dashboard/locations");
    }

    return (
        <LocationSettingsContent
            _user={session.user as any}
            _location={location}
        />
    );
} 