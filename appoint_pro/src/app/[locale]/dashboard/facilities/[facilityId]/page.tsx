import FacilityDetails from '@/components/dashboard/facilities/FacilityDetails';
import { getFacilityById } from '@/services/facility';

export const metadata = {
    title: "Faciliteitbeheer | AppointPro",
    description: "Beheer de faciliteit van uw sportlocatie",
};

export default async function FacilityPage({ params }: { params: { facilityId: string } }) {
    const { facilityId } = params;

    const facility = await getFacilityById(facilityId);

    if (!facility) {
        return <div>Facility not found</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Faciliteitbeheer</h1>
                    <p className="text-muted-foreground">
                        Beheer de faciliteit van uw sportlocatie
                    </p>
                </div>
                <FacilityDetails facility={facility} />
            </div>
        </div>
    );
} 