import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { AppRoutes } from './routes/AppRoutes.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
