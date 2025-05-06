import { FacilitiesList } from "@/components/dashboard/facilities/FacilitiesList"

export const metadata = {
    title: "Faciliteitenbeheer | AppointPro",
    description: "Beheer de faciliteiten van uw sportlocaties",
}

export default async function FacilitiesPage({ params }: { params: Promise<{ locationId: string }> }) {
    const { locationId } = await params;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Faciliteitenbeheer</h1>
                    <p className="text-muted-foreground">
                        Beheer de faciliteiten van uw sportlocatie
                    </p>
                </div>
                <FacilitiesList locationId={locationId} />
            </div>
        </div>
    )
} 