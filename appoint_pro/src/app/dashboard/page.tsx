import { auth } from "@/lib/auth";
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        return null;
    }

    return <DashboardContent session={session} />;
} 