import { db } from '@/lib/server';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SubscriptionPlanCard from './plan-card';

export default async function SubscriptionPlansPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/sign-in');
    }

    // Get the organization
    const organization = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
            subscriptions: {
                where: {
                    status: 'active',
                },
            },
        },
    });

    // Get all active plans
    const plans = await db.subscriptionPlan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' },
    });

    const hasActiveSubscription = organization?.hasActiveSubscription;

    return (
        <div className="container mx-auto py-10">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                    Choose the perfect plan for your organization. All plans include access to our core features.
                </p>

                {hasActiveSubscription && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                        <p className="text-emerald-700">
                            Your organization has an active subscription. You can manage your subscription from the dashboard.
                        </p>
                        <Link
                            href="/dashboard"
                            className="mt-2 inline-block text-emerald-700 underline hover:text-emerald-800"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <SubscriptionPlanCard
                        key={plan.id}
                        plan={plan}
                        hasActiveSubscription={hasActiveSubscription}
                    />
                ))}
            </div>
        </div>
    );
} 