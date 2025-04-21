import { LocationsList } from "@/components/dashboard/locations/LocationsList"

export const metadata = {
    title: "Locatiebeheer | AppointPro",
    description: "Beheer al uw sportlocaties en faciliteiten",
}

export default function LocationsPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Locatiebeheer</h1>
                    <p className="text-muted-foreground">
                        Beheer uw sportlocaties en faciliteiten op één plek
                    </p>
                </div>
                <LocationsList />
            </div>
        </div>
    )
} 