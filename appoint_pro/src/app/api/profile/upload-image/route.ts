import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import { requireRole } from "@/middlewares/role-auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/profile/upload-image - Upload a profile image
 */
async function uploadImageHandler(request: NextRequest) {
    try {
        // Get current session
        const session = await auth();

        // If not authenticated, return 401
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                message: "Authentication required"
            }, { status: 401 });
        }

        // Get user ID from session
        const userId = session.user.id;

        // Parse the form data
        const formData = await request.formData();
        const file = formData.get("image") as File | null;

        // Check if file exists
        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No image file provided"
            }, { status: 400 });
        }

        // Validate file type
        const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validMimeTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
            }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                message: "File size too large. Maximum size is 5MB."
            }, { status: 400 });
        }

        // Create unique filename
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `${userId}-${uuidv4()}.${fileExtension}`;

        // Create path to save file (relative to public directory)
        const relativePath = `/uploads/profile-images/${fileName}`;
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Ensure directory exists
        const directory = path.dirname(absolutePath);
        await ensureDirectoryExists(directory);

        // Convert file to buffer and save
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(absolutePath, buffer);

        // Update user profile with new image URL
        const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}${relativePath}`;

        await db.user.update({
            where: { id: userId },
            data: { image: imageUrl }
        });

        // Log profile image update
        logger.info("User profile image updated", {
            userId,
            imageUrl,
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Profile image uploaded successfully",
            data: { imageUrl }
        }, { status: 200 });

    } catch (error) {
        logger.error("Error uploading profile image", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Error uploading profile image"
        }, { status: 500 });
    }
}

/**
 * Helper function to ensure a directory exists
 */
async function ensureDirectoryExists(directory: string) {
    const fs = require('fs');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Apply middleware and handle the POST request
export const POST = (request: NextRequest) =>
    requireRole("CLIENT")(request, () => uploadImageHandler(request)); 