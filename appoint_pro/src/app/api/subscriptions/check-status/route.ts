import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server';
import { hasActiveSubscription, updateOrganizationSubscriptionStatus } from '@/services/stripe-subscription';

export async function POST(req: NextRequest) {
    try {
        // Get the current user from the session
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Make sure the user has an organization
        if (!session.user.organizationId) {
            return NextResponse.json(
                { success: false, error: 'No organization found for user' },
                { status: 404 }
            );
        }

        const organizationId = session.user.organizationId;

        // Get the current organization
        const organization = await db.organization.findUnique({
            where: { id: organizationId },
            include: {
                subscriptions: {
                    where: {
                        status: 'active',
                        currentPeriodEnd: {
                            gt: new Date(),
                        },
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json(
                { success: false, error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Check for any discrepancy between the flag and actual subscriptions
        const hasActiveSubscriptionsInDb = organization.subscriptions.length > 0;
        let updated = false;

        // If there's a discrepancy, update the flag in the database
        if (hasActiveSubscriptionsInDb !== organization.hasActiveSubscription) {
            await db.organization.update({
                where: { id: organizationId },
                data: { hasActiveSubscription: hasActiveSubscriptionsInDb },
            });
            updated = true;
        }

        // Force a refresh of subscription status from Stripe if requested
        const forceRefresh = req.nextUrl.searchParams.get('forceRefresh') === 'true';
        if (forceRefresh) {
            await updateOrganizationSubscriptionStatus(organizationId);
            updated = true;

            // Get the updated organization after refresh
            const updatedOrg = await db.organization.findUnique({
                where: { id: organizationId },
            });

            return NextResponse.json({
                success: true,
                hasActiveSubscription: updatedOrg?.hasActiveSubscription,
                updated: true,
                message: 'Subscription status refreshed from Stripe',
            });
        }

        return NextResponse.json({
            success: true,
            hasActiveSubscription: organization.hasActiveSubscription,
            updated,
            message: updated
                ? 'Subscription status fixed'
                : 'Subscription status is already correct',
        });

    } catch (error) {
        console.error('Error checking subscription status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check subscription status' },
            { status: 500 }
        );
    }
} 