import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UpcomingAppointmentsContent from "@/app/[locale]/dashboard/appointments/upcoming/upcoming-appointments-content";

export default async function UpcomingAppointmentsPage() {
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

    return (
        <UpcomingAppointmentsContent
            _user={user}
            _organization={organization}
            _locations={locations}
        />
    );
} 