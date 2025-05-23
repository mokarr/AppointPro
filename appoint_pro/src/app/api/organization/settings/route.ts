import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OrganizationSettingsDto from '@/models/Settings/DTOs/OrganizationSettingsDto';
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

        let settings = await prisma.organizationSettings.findUnique({
            where: {
                organizationId: session.user.organizationId,
            },
        });

        if (!settings) {
            // Create default settings if they don't exist
            settings = await prisma.organizationSettings.create({
                data: {
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

        const dto: OrganizationSettingsDto = await request.json();
        let currentSettings = await prisma.organizationSettings.findUnique({
            where: {
                organizationId: session.user.organizationId,
            },
        });

        if (!currentSettings) {
            // Create default settings if they don't exist
            currentSettings = await prisma.organizationSettings.create({
                data: {
                    organizationId: session.user.organizationId,
                    data: defaultSettings as any
                }
            });
        }

        const currentData = currentSettings.data as any;
        const updatedData = { ...currentData };

        // Handle branding updates
        if (dto.branding) {
            // Handle logo changes
            if (dto.branding.logo !== undefined) {
                // If there's a new logo (base64 data)
                if (dto.branding.logo && 'base64Data' in dto.branding.logo) {
                    // Convert base64 to buffer
                    const base64Data = dto.branding.logo.base64Data.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    // Get file extension from base64 data
                    const contentType = dto.branding.logo.base64Data.split(';')[0].split('/')[1];
                    
                    // Upload to S3
                    const { key, url } = await uploadFileToS3(
                        buffer,
                        dto.branding.logo.originalName,
                        contentType
                    );

                    updatedData.branding = {
                        ...updatedData.branding,
                        logo: {
                            key,
                            url
                        },
                    };
                } else if (dto.branding.logo === null) {
                    // If logo is being removed
                    updatedData.branding = {
                        ...updatedData.branding,
                        logo: null,
                    };
                }
            }

            // Handle other branding updates
            if (dto.branding.primaryColor !== undefined) {
                updatedData.branding = {
                    ...updatedData.branding,
                    primaryColor: dto.branding.primaryColor,
                };
            }
            if (dto.branding.secondaryColor !== undefined) {
                updatedData.branding = {
                    ...updatedData.branding,
                    secondaryColor: dto.branding.secondaryColor,
                };
            }
        }

        // Handle opening hours updates
        if (dto.openingHours) {
            updatedData.openingHours = dto.openingHours;
        }

        // Update settings in database
        const updatedSettings = await prisma.organizationSettings.update({
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