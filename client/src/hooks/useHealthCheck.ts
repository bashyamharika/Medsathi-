import { useState, useEffect } from 'react';
import { apiService } from '../services/api.js';
import type { ApiHealthResponse } from '../types/index.js';

export function useHealthCheck() {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiService
      .getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to reach API server');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { health, loading, error };
}
