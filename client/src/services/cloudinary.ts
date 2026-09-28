import { envConfig } from '../config/env.js';

/**
 * MedSathi Cloudinary Foundation Service (Phase 1)
 *
 * Provides a client-side abstraction for Cloudinary image management.
 * SECURITY NOTICE:
 * Cloudinary API secrets are NEVER exposed in client-side code.
 * Only the public cloud name and optional unsigned preset are accessible in the browser.
 * Signed uploads or sensitive operations are delegated to the backend Express server.
 *
 * Actual upload and vision bottle image workflows will be implemented in future phases.
 */

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
}

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
}

export class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = envConfig.cloudinary.cloudName;
    this.uploadPreset = envConfig.cloudinary.uploadPreset;
  }

  /**
   * Helper to check if Cloudinary public client configuration is available
   */
  public isConfigured(): boolean {
    return Boolean(this.cloudName);
  }

  public getCloudName(): string {
    return this.cloudName;
  }

  public getUploadPreset(): string {
    return this.uploadPreset;
  }

  /**
   * Generates a transformed/optimized delivery URL for a Cloudinary public ID.
   * Can be used to optimize profile images, avatars, or medication reference photos.
   */
  public buildOptimizedImageUrl(
    publicId: string,
    options: CloudinaryImageOptions = {}
  ): string {
    if (!this.cloudName) {
      return publicId; // Return raw ID/fallback if unconfigured
    }

    const transformations: string[] = [];

    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }
    transformations.push(`q_${options.quality || 'auto'}`);
    transformations.push(`f_${options.format || 'auto'}`);

    const transString = transformations.join(',');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transString}/${publicId}`;
  }

  /**
   * Uploads a patient profile photo through the secure backend upload endpoint.
   * Keeps CLOUDINARY_API_SECRET strictly server-side.
   */
  public async uploadPatientPhoto(
    file: File
  ): Promise<{ secureUrl: string; publicId: string }> {
    // Client-side validation checks
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Please upload a JPG, PNG, or WebP image.');
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      throw new Error('Image size is too large. Maximum allowed size is 5MB.');
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const endpoint = `${envConfig.apiBaseUrl}/upload/patient-photo`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(
          errorJson.error || 'Failed to upload photo. Please check your network and try again.'
        );
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Upload was not completed successfully.');
      }

      return {
        secureUrl: json.data.secureUrl,
        publicId: json.data.publicId,
      };
    } catch (err) {
      // If server is not reachable, fallback to mock data URL for development resilience
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn(
          '[CloudinaryService] Backend server unreachable at',
          envConfig.apiBaseUrl,
          'Using offline fallback.'
        );
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              secureUrl: reader.result as string,
              publicId: `offline_preview_${Date.now()}`,
            });
          };
          reader.onerror = () => reject(new Error('Failed to read image file.'));
          reader.readAsDataURL(file);
        });
      }

      throw err;
    }
  }

  /**
   * Cleans up an orphaned Cloudinary image if patient database insertion fails
   */
  public async deletePatientPhoto(publicId: string): Promise<void> {
    if (!publicId || publicId.startsWith('offline_preview_')) return;
    try {
      await fetch(`${envConfig.apiBaseUrl}/upload/patient-photo/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[CloudinaryService] Cleanup warning:', err);
    }
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
