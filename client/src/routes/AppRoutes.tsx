import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout.js';
import HomePage from '../pages/HomePage.js';
import LoginPage from '../pages/LoginPage.js';
import RegisterPage from '../pages/RegisterPage.js';
import CaregiverDashboardPage from '../pages/CaregiverDashboardPage.js';
import AddPatientPage from '../pages/AddPatientPage.js';
import PatientCompanionPage from '../pages/PatientCompanionPage.js';
import NotFoundPage from '../pages/NotFoundPage.js';
import ProtectedRoute from '../components/ProtectedRoute.js';

/**
 * MedSathi Route Table — Phase 3 (Patient Management & Caregiver Authentication)
 *
 * Public Routes:
 * - /                         -> Landing Page
 * - /login                    -> Caregiver Login Form
 * - /register                 -> Caregiver Registration Form
 * - *                         -> 404 Not Found
 *
 * Protected Routes (Requires active Caregiver Supabase session):
 * - /caregiver/dashboard      -> Caregiver portal with "My Patients"
 * - /caregiver/patients/new   -> Add patient form with Cloudinary photo upload
 * - /patient/:patientId       -> Patient profile & multi-caregiver management
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Caregiver & Patient Management Routes */}
        <Route
          path="caregiver/dashboard"
          element={
            <ProtectedRoute>
              <CaregiverDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="caregiver/patients/new"
          element={
            <ProtectedRoute>
              <AddPatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patient/:patientId"
          element={
            <ProtectedRoute>
              <PatientCompanionPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
