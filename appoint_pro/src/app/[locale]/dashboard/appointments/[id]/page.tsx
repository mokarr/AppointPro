import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AppointmentDetails from "@/app/[locale]/dashboard/appointments/[id]/appointment-details";

interface AppointmentPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
    const session = await auth();

    if (!session || !session.user) {
        return null;
    }

    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    const user = session.user;
    const organization = user.organization;


    // Fetch the appointment details
    const appointment = await prisma.booking.findUnique({
        where: {
            id: appointmentId
        },
        include: {
            facility: true,
            location: true,
        }
    });

    // If appointment doesn't exist, show 404
    if (!appointment) {
        notFound();
    }

    // Get all locations for this organization (for editing)
    const locations = await prisma.location.findMany({
        where: {
            organizationId: organization.id
        },
        include: {
            facilities: true
        }
    });

    return (
        <AppointmentDetails
            _user={user}
            _organization={organization}
            _appointment={appointment}
            _locations={locations}
        />
    );
} 