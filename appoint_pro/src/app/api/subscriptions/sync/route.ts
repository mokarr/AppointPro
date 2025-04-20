import { NextRequest, NextResponse } from 'next/server';
import { syncActiveSubscriptions } from '@/services/stripe-subscription';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Ensure the request is authenticated
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // For security reasons, add the API key validation
        const apiKey = req.headers.get('x-api-key');
        const validApiKey = process.env.SYNC_API_KEY;

        // Check for valid API key - only allow sync with correct key
        if (apiKey !== validApiKey) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 403 }
            );
        }

        // Start subscription sync in the background
        // We don't await it to avoid timing out the request
        syncActiveSubscriptions().catch(error => {
            console.error('Background sync failed:', error);
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription sync started in the background'
        });
    } catch (error) {
        console.error('Error triggering subscription sync:', error);
        return NextResponse.json(
            { error: 'Failed to trigger subscription sync' },
            { status: 500 }
        );
    }
} 