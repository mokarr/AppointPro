import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const updateSessionSettingsSchema = z.object({
    sessionIds: z.array(z.string()),
    settings: z.object({
        maxParticipants: z.number().min(1)
    })
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateSessionSettingsSchema.parse(body);

        // Update settings for all selected sessions
        await Promise.all(
            validatedData.sessionIds.map(async (sessionId) => {
                // First, get or create settings for the session
                const existingSettings = await prisma.classSessionSettings.findUnique({
                    where: { classSessionId: sessionId }
                });

                if (existingSettings) {
                    // Update existing settings
                    await prisma.classSessionSettings.update({
                        where: { classSessionId: sessionId },
                        data: {
                            data: {
                                ...existingSettings.data as any,
                                maxParticipants: validatedData.settings.maxParticipants
                            }
                        }
                    });
                } else {
                    // Create new settings
                    await prisma.classSessionSettings.create({
                        data: {
                            classSessionId: sessionId,
                            data: {
                                maxParticipants: validatedData.settings.maxParticipants
                            }
                        }
                    });
                }
            })
        );

        return NextResponse.json({
            status: 'success',
            message: 'Session settings updated successfully'
        });

    } catch (error) {
        console.error('Error updating session settings:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                status: 'error',
                error: 'Invalid data provided',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            status: 'error',
            error: 'Failed to update session settings'
        }, { status: 500 });
    }
} 