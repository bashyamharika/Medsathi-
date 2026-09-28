/**
 * Core MedSathi Application Types - Phase 2 (Caregiver Authentication)
 */

export interface NavLinkItem {
  label: string;
  path: string;
  isExternal?: boolean;
}

export interface PatientRouteParams {
  patientId: string;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
}

/**
 * Role definition: In MedSathi Phase 2, authenticated users are Caregivers.
 */
export type UserRole = 'caregiver';

/**
 * Caregiver Profile representation matching public.profiles schema.
 */
export interface CaregiverProfile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  age: number | null;
  phone: string | null;
  relationship_to_patient: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload required to register a new caregiver account
 */
export interface SignUpFormData {
  fullName: string;
  age: string;
  phone: string;
  relationshipToPatient: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Payload required to sign in an existing caregiver
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Generic response wrapper for auth service operations
 */
export interface AuthResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Profile creation input payload
 */
export interface CreateProfilePayload {
  userId: string;
  fullName: string;
  age?: number | null;
  phone?: string | null;
  relationshipToPatient?: string | null;
}

/**
 * Profile update input payload
 */
export interface UpdateProfilePayload {
  fullName?: string;
  age?: number | null;
  phone?: string | null;
  relationshipToPatient?: string | null;
}

/**
 * Phase 3 — Patient Management Types
 */
export type Patient = {
  id: string;
  full_name: string;
  age: number;
  photo_url: string;
  photo_public_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CaregiverPatient = {
  id: string;
  caregiver_user_id: string;
  patient_id: string;
  is_primary: boolean;
  created_at: string;
};

export type PatientWithRelationship = Patient & {
  is_primary: boolean;
};

export interface CreatePatientPayload {
  fullName: string;
  age: number;
  photoUrl: string;
  photoPublicId?: string | null;
}

export interface UpdatePatientPayload {
  fullName?: string;
  age?: number;
  photoUrl?: string;
  photoPublicId?: string | null;
}

export interface AssignedCaregiver {
  id?: string;
  caregiver_user_id: string;
  full_name: string;
  email?: string;
  phone?: string | null;
  relationship_to_patient?: string | null;
  is_primary: boolean;
  created_at: string;
}

