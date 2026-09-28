import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig } from '../types/index.js';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralized environment configuration module.
 * Credentials and runtime variables should ONLY be accessed through this object.
 */
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || undefined,
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || undefined,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || undefined,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || undefined,
};

export default config;
