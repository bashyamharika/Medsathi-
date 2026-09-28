export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
}
