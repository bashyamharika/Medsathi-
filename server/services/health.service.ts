import type { HealthResponse } from '../types/index.js';

export class HealthService {
  /**
   * Retrieves current service health status.
   * Matches MedSathi Phase 1 specification:
   * { "status": "ok", "service": "medsathi-api" }
   */
  public getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'medsathi-api',
    };
  }
}

export const healthService = new HealthService();
