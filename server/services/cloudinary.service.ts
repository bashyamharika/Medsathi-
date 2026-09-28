import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import config from '../config/env.js';

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

export class CloudinaryService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      config.cloudinaryCloudName &&
      config.cloudinaryApiKey &&
      config.cloudinaryApiSecret
    );

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: config.cloudinaryCloudName,
        api_key: config.cloudinaryApiKey,
        api_secret: config.cloudinaryApiSecret,
        secure: true,
      });
      console.log('[CloudinaryService] Configured with cloud:', config.cloudinaryCloudName);
    } else {
      console.warn(
        '[CloudinaryService] CLOUDINARY_API_SECRET / credentials not fully configured. Development mock uploads will be used.'
      );
    }
  }

  /**
   * Uploads a patient photo buffer to Cloudinary with secure parameters.
   * Only accessible on the server.
   */
  public async uploadPatientPhoto(
    fileBuffer: Buffer,
    _mimetype: string
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      // In development environments without live Cloudinary credentials, return a warm dignified portrait
      const mockPublicId = `medsathi_mock_${Date.now()}`;
      return {
        secureUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        publicId: mockPublicId,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'medsathi/patients',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error('[CloudinaryService] Upload error:', error);
            return reject(new Error(error?.message || 'Failed to upload photo to Cloudinary.'));
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Deletes a patient photo from Cloudinary (used to clean up orphaned uploads if patient record creation fails)
   */
  public async deletePatientPhoto(publicId: string): Promise<boolean> {
    if (!this.isConfigured || publicId.startsWith('medsathi_mock_')) {
      return true;
    }

    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (err) {
      console.warn('[CloudinaryService] Failed to clean up image:', publicId, err);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
