import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewAppointmentForm from "@/app/dashboard/appointments/new/new-appointment-form";

export default async function NewAppointmentPage({
    searchParams
}: {
    searchParams: Promise<{
        start?: string;
        end?: string;
        facilityId?: string;
        locationId?: string;
    }>
}) {
    const session = await auth();

    if (!session || !session.user) {
        return null;
    }

    const user = session.user;
    const organization = user.organization;

    // Find all locations for this organization
    const locations = await prisma.location.findMany({
        where: {
            organizationId: organization.id
        },
        include: {
            facilities: true
        }
    });

    // Await searchParams since it's a Promise
    const resolvedSearchParams = await searchParams;

    return (
        <NewAppointmentForm
            _user={user}
            _organization={organization}
            _locations={locations}
            initialValues={{
                startTime: resolvedSearchParams.start,
                endTime: resolvedSearchParams.end,
                facilityId: resolvedSearchParams.facilityId,
                locationId: resolvedSearchParams.locationId
            }}
        />
    );
} 