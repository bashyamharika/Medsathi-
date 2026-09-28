import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Activity } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm animate-pulse mb-4">
          <Activity className="w-8 h-8 stroke-[2.5]" />
        </div>
        <p className="text-base font-bold text-stone-900">Verifying Caregiver Session</p>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">
          Ensuring secure and private access to patient care information...
        </p>
      </div>
    );
  }

  if (!session) {
    // Preserve attempted destination to redirect back upon login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};

export default ProtectedRoute;
