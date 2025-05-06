import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TimeTableContent from "@/app/[locale]/dashboard/appointments/timetable/timetable-content";

export default async function TimeTablePage() {
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
        <TimeTableContent
            _user={user}
            _organization={organization}
            _locations={locations}
        />
    );
} 