import LocationSettings from '@/components/dashboard/locations/LocationSettings';

export const metadata = {
    title: "Locatie-instellingen | AppointPro",
    description: "Beheer de instellingen van uw locatie",
};

export default async function LocationSettingsPage({ params }: { params: Promise<{ locationId: string }> }) {
    const { locationId } = await params;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Locatie-instellingen</h1>
                    <p className="text-muted-foreground">
                        Beheer de instellingen van uw locatie
                    </p>
                </div>
                <LocationSettings locationId={locationId} />
            </div>
        </div>
    );
} 