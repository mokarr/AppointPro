import { NextResponse } from 'next/server';
import { saveLogo, deleteLogo } from '@/data/logo-storage';

export async function POST(request: Request) {
    try {
        const { base64Data, originalFilename } = await request.json();
        
        if (!base64Data || !originalFilename) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const logoMetadata = await saveLogo(base64Data, originalFilename);
        return NextResponse.json(logoMetadata);
    } catch (error) {
        console.error('Error saving logo:', error);
        return NextResponse.json(
            { error: 'Failed to save logo' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { filename } = await request.json();
        
        if (!filename) {
            return NextResponse.json(
                { error: 'Missing filename' },
                { status: 400 }
            );
        }

        await deleteLogo(filename);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting logo:', error);
        return NextResponse.json(
            { error: 'Failed to delete logo' },
            { status: 500 }
        );
    }
} 