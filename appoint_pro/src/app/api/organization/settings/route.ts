import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SettingsPayload, OrganizationSettings } from '@/types/settings';
import { uploadFileToS3 } from '@/lib/s3';

const defaultSettings = {
    branding: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        logo: null
    },
    openingHours: [
        { day: 'Maandag', open: '', close: '' },
        { day: 'Dinsdag', open: '', close: '' },
        { day: 'Woensdag', open: '', close: '' },
        { day: 'Donderdag', open: '', close: '' },
        { day: 'Vrijdag', open: '', close: '' },
        { day: 'Zaterdag', open: '', close: '' },
        { day: 'Zondag', open: '', close: '' },
    ]
} as const;

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        let settings = await prisma.settings.findUnique({
            where: {
                organizationId: session.user.organizationId,
            },
        });

        if (!settings) {
            // Create default settings if they don't exist
            settings = await prisma.settings.create({
                data: {
                    type: 'ORGANIZATION',
                    organizationId: session.user.organizationId,
                    data: defaultSettings as any
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.organizationId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload: SettingsPayload = await request.json();
        let currentSettings = await prisma.settings.findUnique({
            where: {
                organizationId: session.user.organizationId,
            },
        });

        if (!currentSettings) {
            // Create default settings if they don't exist
            currentSettings = await prisma.settings.create({
                data: {
                    type: 'ORGANIZATION',
                    organizationId: session.user.organizationId,
                    data: defaultSettings as any
                }
            });
        }

        const currentData = currentSettings.data as any;
        const updatedData = { ...currentData };

        // Handle branding updates
        if (payload.branding) {
            // Handle logo changes
            if (payload.branding.logo !== undefined) {
                // If there's a new logo (base64 data)
                if (payload.branding.logo && 'base64Data' in payload.branding.logo) {
                    // Convert base64 to buffer
                    const base64Data = payload.branding.logo.base64Data.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    // Get file extension from base64 data
                    const contentType = payload.branding.logo.base64Data.split(';')[0].split('/')[1];
                    
                    // Upload to S3
                    const { key, url } = await uploadFileToS3(
                        buffer,
                        payload.branding.logo.originalName,
                        contentType
                    );

                    updatedData.branding = {
                        ...updatedData.branding,
                        logo: {
                            key,
                            url
                        },
                    };
                } else if (payload.branding.logo === null) {
                    // If logo is being removed
                    updatedData.branding = {
                        ...updatedData.branding,
                        logo: null,
                    };
                }
            }

            // Handle other branding updates
            if (payload.branding.primaryColor !== undefined) {
                updatedData.branding = {
                    ...updatedData.branding,
                    primaryColor: payload.branding.primaryColor,
                };
            }
            if (payload.branding.secondaryColor !== undefined) {
                updatedData.branding = {
                    ...updatedData.branding,
                    secondaryColor: payload.branding.secondaryColor,
                };
            }
        }

        // Handle opening hours updates
        if (payload.openingHours) {
            updatedData.openingHours = payload.openingHours;
        }

        // Update settings in database
        const updatedSettings = await prisma.settings.update({
            where: {
                id: currentSettings.id,
            },
            data: {
                data: updatedData,
            },
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
} 