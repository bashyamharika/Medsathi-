import { envConfig } from '../config/env.js';
import type { ApiHealthResponse } from '../types/index.js';

/**
 * Base API Service configured with centralized environment variables.
 * In Phase 1, only health check is connected to verify backend connectivity.
 */
export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = envConfig.apiBaseUrl;
  }

  /**
   * Check backend server health status
   */
  public async getHealth(): Promise<ApiHealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with HTTP status ${response.status}`);
    }
    return (await response.json()) as ApiHealthResponse;
  }
}

export const apiService = new ApiService();
