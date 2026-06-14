import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadResult {
  key: string;
  url: string;
  originalName: string;
  size: number;
}

export async function uploadProductImage(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  productId: string
): Promise<UploadResult> {
  // Resize and optimize image for analysis
  const optimizedBuffer = await sharp(fileBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const extension = 'jpg';
  const key = `products/${productId}/${uuidv4()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: optimizedBuffer,
      ContentType: 'image/jpeg',
      Metadata: {
        originalName,
        productId,
        uploadedAt: new Date().toISOString(),
      },
    })
  );

  const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return {
    key,
    url,
    originalName,
    size: optimizedBuffer.length,
  };
}

export async function uploadMultipleImages(
  files: { buffer: Buffer; originalname: string; mimetype: string }[],
  productId: string
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadProductImage(file.buffer, file.originalname, file.mimetype, productId))
  );
  return results;
}

export async function deleteImage(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    })
  );
}
