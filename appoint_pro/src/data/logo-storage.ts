import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const LOGO_DIRECTORY = path.join(process.cwd(), 'public', 'logos');

// Ensure the logos directory exists
if (!fs.existsSync(LOGO_DIRECTORY)) {
    fs.mkdirSync(LOGO_DIRECTORY, { recursive: true });
}

export interface LogoMetadata {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    uploadedAt: Date;
}

export async function saveLogo(base64Data: string, originalFilename: string): Promise<LogoMetadata> {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
        throw new Error('Invalid base64 image data');
    }

    // Generate a unique filename
    const fileExtension = path.extname(originalFilename) || '.png';
    const uniqueId = uuidv4();
    const filename = `${uniqueId}${fileExtension}`;
    const filePath = path.join(LOGO_DIRECTORY, filename);

    // Save the file
    await fs.promises.writeFile(filePath, base64Image, { encoding: 'base64' });

    // Return metadata about the saved logo
    return {
        id: uniqueId,
        filename,
        originalName: originalFilename,
        path: `/logos/${filename}`,
        uploadedAt: new Date()
    };
}

export async function deleteLogo(filename: string): Promise<void> {
    const filePath = path.join(LOGO_DIRECTORY, filename);
    if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }
}

export async function getLogoPath(filename: string): Promise<string | null> {
    const filePath = path.join(LOGO_DIRECTORY, filename);
    if (fs.existsSync(filePath)) {
        return `/logos/${filename}`;
    }
    return null;
} 