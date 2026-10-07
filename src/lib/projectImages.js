import { randomUUID } from 'node:crypto';
import cloudinary from '@/lib/cloudinary';
import { validateProjectImage } from '@/lib/projectValidation';

export async function uploadProjectImage(file) {
  validateProjectImage(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'portfolio/projects', public_id: randomUUID(), resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'webp'], overwrite: false,
    }, (error, result) => {
      if (error) reject(error);
      else resolve({ imageUrl: result.secure_url, imagePublicId: result.public_id });
    });
    stream.end(buffer);
  });
}

export async function deleteProjectImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true }).catch((error) => {
    console.error('Project image cleanup failed:', error.message);
  });
}
