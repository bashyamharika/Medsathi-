import type { ApiResponse } from '../types/index.js';

export const successResponse = <T>(data: T): ApiResponse<T> => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (errorMessage: string): ApiResponse => {
  return {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  };
};
