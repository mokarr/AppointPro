import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_KEY!,
        secretAccessKey: process.env.AWS_SECRET!,
    }
});

export async function uploadFileToS3(buffer: Buffer, fileName: string, contentType: string) {
    const key = `${process.env.ENVIRONMENT}/uploads/${fileName}-${Date.now()}-${randomUUID()}`;
    
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: `image/${contentType}`,
    });

    await s3Client.send(command);
    return {
        key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
} 