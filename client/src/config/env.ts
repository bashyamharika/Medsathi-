/**
 * Centralized client environment configuration.
 * All frontend environment variables must be accessed through this module.
 * Credentials are not hardcoded; values are read safely from import.meta.env.
 */

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
}

export interface CloudinaryClientConfig {
  cloudName: string;
  uploadPreset: string;
}

export interface ClientConfig {
  supabase: SupabaseClientConfig;
  cloudinary: CloudinaryClientConfig;
  apiBaseUrl: string;
  isProduction: boolean;
  isSupabaseConfigured: boolean;
  isCloudinaryConfigured: boolean;
}

const supabaseConfig: SupabaseClientConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

const cloudinaryConfig: CloudinaryClientConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

// Check if valid credentials are provided
const hasValidSupabaseConfig = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey
);

const hasValidCloudinaryConfig = Boolean(cloudinaryConfig.cloudName);

export const envConfig: ClientConfig = {
  supabase: supabaseConfig,
  cloudinary: cloudinaryConfig,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  isProduction: import.meta.env.PROD,
  isSupabaseConfigured: hasValidSupabaseConfig,
  isCloudinaryConfigured: hasValidCloudinaryConfig,
};

export default envConfig;
