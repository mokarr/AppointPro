import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function SubscriptionManagePage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/sign-in');
    }

    // Redirect to dashboard since subscription management is now integrated there
    redirect('/dashboard#subscription-management-section');
} 