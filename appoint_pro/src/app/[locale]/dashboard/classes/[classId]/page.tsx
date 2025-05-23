import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { ClassDetailContent } from "@/app/[locale]/dashboard/classes/[classId]/ClassDetailContent";

async function getClassWithDetails(classId: string) {
    const session = await auth();
    
    if (!session?.user) {
        redirect("/sign-in");
    }

    try {
        const classData = await prisma.class.findUnique({
            where: { 
                id: classId,
                location: {
                    organizationId: session.user.organizationId
                }
            },
            include: {
                location: true,
                facility: true,
                classSessions: {
                    orderBy: {
                        startTime: 'asc'
                    },
                    include: {
                        bookings: true,
                    }
                }
            }
        });

        if (!classData) {
            notFound();
        }

        return classData;
    } catch (error) {
        console.error('Error fetching class details:', error);
        throw error;
    }
}

export default async function ClassPage({ params }: { params: Promise<{ classId: string }> }) {
    const resolvedParams = await params;
    const classData = await getClassWithDetails(resolvedParams.classId);
    
    return <ClassDetailContent classData={classData} />;
} 