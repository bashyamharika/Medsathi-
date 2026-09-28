import { supabase } from './supabase.js';
import { envConfig } from '../config/env.js';
import type {
  Patient,
  PatientWithRelationship,
  CreatePatientPayload,
  UpdatePatientPayload,
  AssignedCaregiver,
} from '../types/index.js';

// In-memory mock store for offline testing or unconfigured Supabase development
interface MockPatientStore {
  patients: Patient[];
  relationships: {
    id: string;
    caregiver_user_id: string;
    patient_id: string;
    is_primary: boolean;
    created_at: string;
  }[];
}

const mockStore: MockPatientStore = {
  patients: [],
  relationships: [],
};

export class PatientService {
  /**
   * Creates a new patient record and establishes the authenticated caregiver as Primary Caregiver.
   */
  public async createPatient(
    payload: CreatePatientPayload
  ): Promise<{ patient: PatientWithRelationship | null; error: string | null }> {
    // Basic validation
    if (!payload.fullName || !payload.fullName.trim()) {
      return { patient: null, error: "Please enter the patient's name." };
    }
    if (!payload.age || payload.age <= 0 || payload.age > 130) {
      return { patient: null, error: 'Please enter a valid age.' };
    }
    if (!payload.photoUrl || !payload.photoUrl.trim()) {
      return { patient: null, error: 'Please upload a patient photo.' };
    }

    if (!envConfig.isSupabaseConfigured) {
      const mockPatientId = `mock-patient-${Date.now()}`;
      const now = new Date().toISOString();
      const mockPatient: Patient = {
        id: mockPatientId,
        full_name: payload.fullName.trim(),
        age: payload.age,
        photo_url: payload.photoUrl,
        photo_public_id: payload.photoPublicId || null,
        created_at: now,
        updated_at: now,
      };

      mockStore.patients.push(mockPatient);
      mockStore.relationships.push({
        id: `rel-${Date.now()}`,
        caregiver_user_id: 'mock-caregiver-user-id',
        patient_id: mockPatientId,
        is_primary: true,
        created_at: now,
      });

      return {
        patient: { ...mockPatient, is_primary: true },
        error: null,
      };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        return { patient: null, error: 'You must be signed in as a caregiver to create a patient.' };
      }

      // 1. Try atomic RPC first if migration installed
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'create_patient_with_primary_caregiver',
        {
          p_full_name: payload.fullName.trim(),
          p_age: payload.age,
          p_photo_url: payload.photoUrl.trim(),
          p_photo_public_id: payload.photoPublicId || null,
        }
      );

      if (!rpcError && rpcData) {
        const created = rpcData as PatientWithRelationship;
        return { patient: created, error: null };
      }

      // 2. Direct Supabase Table Insert fallback
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert({
          full_name: payload.fullName.trim(),
          age: payload.age,
          photo_url: payload.photoUrl.trim(),
          photo_public_id: payload.photoPublicId || null,
        })
        .select()
        .single();

      if (patientError || !patientData) {
        console.error('[PatientService] Error creating patient:', patientError);
        return {
          patient: null,
          error: patientError?.message || 'Failed to create patient record.',
        };
      }

      // Establish Primary Caregiver relationship
      const { error: relError } = await supabase.from('caregiver_patients').insert({
        caregiver_user_id: currentUser.id,
        patient_id: patientData.id,
        is_primary: true,
      });

      if (relError) {
        console.error('[PatientService] Error linking primary caregiver:', relError);
        // Rollback patient insertion to avoid orphaned record
        await supabase.from('patients').delete().eq('id', patientData.id);
        return {
          patient: null,
          error: 'Failed to assign caregiver relationship. Patient creation was rolled back.',
        };
      }

      return {
        patient: {
          ...(patientData as Patient),
          is_primary: true,
        },
        error: null,
      };
    } catch (err) {
      console.error('[PatientService] Unexpected error creating patient:', err);
      return {
        patient: null,
        error: err instanceof Error ? err.message : 'Unexpected failure creating patient.',
      };
    }
  }

  /**
   * Fetches all patients assigned to the currently authenticated caregiver.
   */
  public async getMyPatients(): Promise<{
    patients: PatientWithRelationship[];
    error: string | null;
  }> {
    if (!envConfig.isSupabaseConfigured) {
      const result: PatientWithRelationship[] = mockStore.patients.map((p) => {
        const rel = mockStore.relationships.find((r) => r.patient_id === p.id);
        return {
          ...p,
          is_primary: rel ? rel.is_primary : true,
        };
      });
      return { patients: result, error: null };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        return { patients: [], error: 'Not authenticated' };
      }

      // Query caregiver_patients joined with patients
      const { data, error } = await supabase
        .from('caregiver_patients')
        .select(
          `
          is_primary,
          patient_id,
          patients (
            id,
            full_name,
            age,
            photo_url,
            photo_public_id,
            created_at,
            updated_at
          )
        `
        )
        .eq('caregiver_user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[PatientService] Error fetching patients:', error);
        return { patients: [], error: error.message || 'Unable to load patients.' };
      }

      type JoinedRow = {
        is_primary: boolean;
        patient_id: string;
        patients: Patient | null;
      };

      const rows = (data as unknown as JoinedRow[]) || [];
      const patients: PatientWithRelationship[] = rows
        .filter((r) => r.patients !== null)
        .map((r) => ({
          ...(r.patients as Patient),
          is_primary: r.is_primary,
        }));

      return { patients, error: null };
    } catch (err) {
      console.error('[PatientService] Unexpected error in getMyPatients:', err);
      return {
        patients: [],
        error: err instanceof Error ? err.message : 'Failed to retrieve patients.',
      };
    }
  }

  /**
   * Fetches single patient by ID and checks caregiver relationship.
   */
  public async getPatientById(
    patientId: string
  ): Promise<{ patient: PatientWithRelationship | null; error: string | null }> {
    if (!patientId) {
      return { patient: null, error: 'Patient ID is required.' };
    }

    if (!envConfig.isSupabaseConfigured) {
      const p = mockStore.patients.find((item) => item.id === patientId);
      if (!p) return { patient: null, error: 'Patient not found.' };
      const rel = mockStore.relationships.find((r) => r.patient_id === p.id);
      return {
        patient: { ...p, is_primary: rel ? rel.is_primary : true },
        error: null,
      };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      if (!currentUser) {
        return { patient: null, error: 'Authentication required.' };
      }

      // 1. Fetch patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError || !patient) {
        return {
          patient: null,
          error: patientError?.message || 'Patient not found or you do not have permission to view.',
        };
      }

      // 2. Fetch relationship for this caregiver
      const { data: rel } = await supabase
        .from('caregiver_patients')
        .select('is_primary')
        .eq('patient_id', patientId)
        .eq('caregiver_user_id', currentUser.id)
        .maybeSingle();

      return {
        patient: {
          ...(patient as Patient),
          is_primary: rel?.is_primary ?? false,
        },
        error: null,
      };
    } catch (err) {
      return {
        patient: null,
        error: err instanceof Error ? err.message : 'Error fetching patient.',
      };
    }
  }

  /**
   * Updates patient information (allowed only for Primary Caregiver per RLS).
   */
  public async updatePatient(
    patientId: string,
    payload: UpdatePatientPayload
  ): Promise<{ patient: Patient | null; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      const p = mockStore.patients.find((item) => item.id === patientId);
      if (!p) return { patient: null, error: 'Patient not found.' };
      if (payload.fullName) p.full_name = payload.fullName.trim();
      if (payload.age) p.age = payload.age;
      if (payload.photoUrl) p.photo_url = payload.photoUrl;
      p.updated_at = new Date().toISOString();
      return { patient: p, error: null };
    }

    try {
      const updates: Record<string, unknown> = {};
      if (payload.fullName !== undefined) updates.full_name = payload.fullName.trim();
      if (payload.age !== undefined) updates.age = payload.age;
      if (payload.photoUrl !== undefined) updates.photo_url = payload.photoUrl.trim();
      if (payload.photoPublicId !== undefined) updates.photo_public_id = payload.photoPublicId;

      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        return {
          patient: null,
          error: error.message.includes('policy')
            ? 'Only the Primary Caregiver has permission to modify patient details.'
            : error.message || 'Failed to update patient.',
        };
      }

      return { patient: data as Patient, error: null };
    } catch (err) {
      return {
        patient: null,
        error: err instanceof Error ? err.message : 'Error updating patient.',
      };
    }
  }

  /**
   * Deletes a patient profile and associated caregiver links (Primary Caregiver only).
   */
  public async deletePatient(
    patientId: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      mockStore.patients = mockStore.patients.filter((p) => p.id !== patientId);
      mockStore.relationships = mockStore.relationships.filter((r) => r.patient_id !== patientId);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('patients').delete().eq('id', patientId);

      if (error) {
        return {
          success: false,
          error: error.message.includes('policy')
            ? 'Only the Primary Caregiver can delete this patient.'
            : error.message || 'Failed to delete patient.',
        };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error deleting patient.',
      };
    }
  }

  /**
   * Retrieves all caregivers assigned to a given patient.
   */
  public async getPatientCaregivers(
    patientId: string
  ): Promise<{ caregivers: AssignedCaregiver[]; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      return {
        caregivers: [
          {
            caregiver_user_id: 'mock-caregiver-user-id',
            full_name: 'Primary Caregiver',
            email: 'caregiver@example.com',
            is_primary: true,
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      };
    }

    try {
      // 1. Fetch relationships
      const { data: rels, error: relError } = await supabase
        .from('caregiver_patients')
        .select('id, caregiver_user_id, is_primary, created_at')
        .eq('patient_id', patientId)
        .order('is_primary', { ascending: false });

      if (relError) {
        return { caregivers: [], error: relError.message };
      }

      if (!rels || rels.length === 0) {
        return { caregivers: [], error: null };
      }

      // 2. Fetch profile info for each caregiver user ID
      const userIds = rels.map((r) => r.caregiver_user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, relationship_to_patient')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const caregivers: AssignedCaregiver[] = rels.map((r) => {
        const p = profileMap.get(r.caregiver_user_id);
        return {
          id: r.id,
          caregiver_user_id: r.caregiver_user_id,
          full_name: p?.full_name || 'Caregiver',
          phone: p?.phone || null,
          relationship_to_patient: p?.relationship_to_patient || null,
          is_primary: r.is_primary,
          created_at: r.created_at,
        };
      });

      return { caregivers, error: null };
    } catch (err) {
      return {
        caregivers: [],
        error: err instanceof Error ? err.message : 'Error fetching caregivers.',
      };
    }
  }

  /**
   * Adds an existing caregiver by email to a patient (enforces max 3 caregivers limit).
   */
  public async addCaregiverToPatient(
    patientId: string,
    caregiverEmail: string
  ): Promise<{ caregiver: AssignedCaregiver | null; error: string | null }> {
    const trimmedEmail = caregiverEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      return { caregiver: null, error: 'Please enter caregiver email address.' };
    }

    if (!envConfig.isSupabaseConfigured) {
      const currentCount = mockStore.relationships.filter((r) => r.patient_id === patientId).length;
      if (currentCount >= 3) {
        return {
          caregiver: null,
          error: 'Maximum limit reached: A patient cannot have more than 3 caregivers.',
        };
      }

      const mockRel: AssignedCaregiver = {
        caregiver_user_id: `mock-secondary-${Date.now()}`,
        full_name: 'Secondary Caregiver',
        email: trimmedEmail,
        is_primary: false,
        created_at: new Date().toISOString(),
      };
      mockStore.relationships.push({
        id: `rel-${Date.now()}`,
        caregiver_user_id: mockRel.caregiver_user_id,
        patient_id: patientId,
        is_primary: false,
        created_at: mockRel.created_at,
      });
      return { caregiver: mockRel, error: null };
    }

    try {
      // 1. Check existing caregiver count for this patient
      const { count, error: countError } = await supabase
        .from('caregiver_patients')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId);

      if (countError) {
        return { caregiver: null, error: countError.message };
      }

      if (count !== null && count >= 3) {
        return {
          caregiver: null,
          error: 'Maximum limit reached: A patient cannot have more than 3 caregivers.',
        };
      }

      // 2. Identify existing caregiver via RPC lookup
      const { data: foundCaregiver, error: lookupError } = await supabase.rpc(
        'find_caregiver_by_email',
        { p_email: trimmedEmail }
      );

      if (lookupError || !foundCaregiver) {
        return {
          caregiver: null,
          error: 'This caregiver does not have a MedSathi account yet.',
        };
      }

      const targetUserId = foundCaregiver.user_id as string;

      // 3. Check if caregiver is already assigned
      const { data: existingRel } = await supabase
        .from('caregiver_patients')
        .select('id')
        .eq('patient_id', patientId)
        .eq('caregiver_user_id', targetUserId)
        .maybeSingle();

      if (existingRel) {
        return {
          caregiver: null,
          error: 'This caregiver is already assigned to this patient.',
        };
      }

      // 4. Insert relationship row (is_primary = false)
      const { data: inserted, error: insertError } = await supabase
        .from('caregiver_patients')
        .insert({
          patient_id: patientId,
          caregiver_user_id: targetUserId,
          is_primary: false,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.message.includes('Maximum limit') || insertError.message.includes('check_max_caregivers')) {
          return {
            caregiver: null,
            error: 'Maximum limit reached: A patient cannot have more than 3 caregivers.',
          };
        }
        if (insertError.message.includes('duplicate') || insertError.message.includes('uq_caregiver_patient')) {
          return {
            caregiver: null,
            error: 'This caregiver is already assigned to this patient.',
          };
        }
        return {
          caregiver: null,
          error: insertError.message || 'Failed to add caregiver.',
        };
      }

      return {
        caregiver: {
          id: inserted.id,
          caregiver_user_id: targetUserId,
          full_name: foundCaregiver.full_name,
          email: trimmedEmail,
          phone: foundCaregiver.phone,
          relationship_to_patient: foundCaregiver.relationship_to_patient,
          is_primary: false,
          created_at: inserted.created_at,
        },
        error: null,
      };
    } catch (err) {
      return {
        caregiver: null,
        error: err instanceof Error ? err.message : 'Error adding caregiver.',
      };
    }
  }

  /**
   * Removes a secondary caregiver from a patient (Primary Caregiver only).
   */
  public async removeCaregiverFromPatient(
    patientId: string,
    caregiverUserId: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      mockStore.relationships = mockStore.relationships.filter(
        (r) => !(r.patient_id === patientId && r.caregiver_user_id === caregiverUserId)
      );
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('caregiver_patients')
        .delete()
        .eq('patient_id', patientId)
        .eq('caregiver_user_id', caregiverUserId)
        .eq('is_primary', false); // Primary caregiver cannot be removed via this method

      if (error) {
        return {
          success: false,
          error: error.message.includes('policy')
            ? 'Only the Primary Caregiver has permission to remove caregivers.'
            : error.message || 'Failed to remove caregiver.',
        };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error removing caregiver.',
      };
    }
  }
}

export const patientService = new PatientService();
export default patientService;
