import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { envConfig } from '../config/env.js';

interface AppContextValue {
  appName: string;
  tagline: string;
  version: string;
  isSupabaseConfigured: boolean;
  isCloudinaryConfigured: boolean;
  apiBaseUrl: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useMemo<AppContextValue>(
    () => ({
      appName: 'MedSathi',
      tagline: 'Care that speaks. Confidence that stays.',
      version: '0.1.0-phase1',
      isSupabaseConfigured: envConfig.isSupabaseConfigured,
      isCloudinaryConfigured: envConfig.isCloudinaryConfigured,
      apiBaseUrl: envConfig.apiBaseUrl,
    }),
    []
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
