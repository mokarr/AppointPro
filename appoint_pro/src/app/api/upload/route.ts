import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_KEY!,
        secretAccessKey: process.env.AWS_SECRET!,
    }
});

async function uploadFileToS3(buffer: Buffer, fileName: string, contentType: string) {


    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `uploads/${fileName}-${Date.now()}`,
        Body: buffer,
        ContentType: `image/${contentType}`,
    });

    const response = await s3Client.send(command);
    return fileName;
}

export async function POST(request: NextRequest) {
 
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = await uploadFileToS3(buffer, file.name, file.type);

        return NextResponse.json({ message: "File uploaded successfully", fileName }, { status: 200 });

      
            
    } catch (error) {
        return NextResponse.json({ message: "Error uploading file" }, { status: 500 });
    }
}