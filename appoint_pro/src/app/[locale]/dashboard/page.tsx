import { auth } from "@/lib/auth";
import DashboardContent from '@/components/DashboardContent';
import { redirect } from "next/navigation";
import { db } from "@/lib/server";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        console.log('No session found');
        redirect('/sign-in');
    }



    // Fetch organization details including subscription data
    const organization = await db.organization.findUnique({
        where: {
            id: session.user.organizationId,
        },
        include: {
            subscriptions: {
                where: {
                    status: 'active',
                    currentPeriodEnd: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    currentPeriodEnd: 'desc'
                },
                take: 1
            }
        }
    });

    if (!organization?.hasActiveSubscription) {
        redirect('/subscription/plans');
    }

    // Get the current active subscription if any
    const activeSubscription = organization.subscriptions.length > 0
        ? organization.subscriptions[0]
        : null;

    return (
        <DashboardContent
            session={session}
            organization={{
                name: organization.name,
                hasActiveSubscription: organization.hasActiveSubscription
            }}
            subscription={activeSubscription}
        />
    );
} 