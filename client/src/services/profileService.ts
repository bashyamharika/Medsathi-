import { supabase } from './supabase.js';
import { envConfig } from '../config/env.js';
import type {
  CaregiverProfile,
  CreateProfilePayload,
  UpdateProfilePayload,
} from '../types/index.js';

export class ProfileService {
  /**
   * Creates or upserts a caregiver profile record for an authenticated user.
   * Enforces role = 'caregiver'.
   */
  public async createProfile(
    payload: CreateProfilePayload
  ): Promise<{ profile: CaregiverProfile | null; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      // In unconfigured development mode, return mock profile structure
      const mockProfile: CaregiverProfile = {
        id: 'mock-profile-id',
        user_id: payload.userId,
        role: 'caregiver',
        full_name: payload.fullName,
        age: payload.age || null,
        phone: payload.phone || null,
        relationship_to_patient: payload.relationshipToPatient || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { profile: mockProfile, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: payload.userId,
            role: 'caregiver',
            full_name: payload.fullName,
            age: payload.age || null,
            phone: payload.phone || null,
            relationship_to_patient: payload.relationshipToPatient || null,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[ProfileService] Error creating profile:', error);
        return {
          profile: null,
          error: error.message || 'Unable to create caregiver profile record.',
        };
      }

      return { profile: data as CaregiverProfile, error: null };
    } catch (err) {
      console.error('[ProfileService] Unexpected error creating profile:', err);
      return {
        profile: null,
        error: err instanceof Error ? err.message : 'Unexpected profile creation failure.',
      };
    }
  }

  /**
   * Fetches caregiver profile for the specified user ID.
   */
  public async getMyProfile(
    userId: string
  ): Promise<{ profile: CaregiverProfile | null; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      const mockProfile: CaregiverProfile = {
        id: 'mock-profile-id',
        user_id: userId,
        role: 'caregiver',
        full_name: 'Caregiver Demo',
        age: 42,
        phone: '+91 98765 43210',
        relationship_to_patient: 'Daughter',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { profile: mockProfile, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[ProfileService] Error fetching profile:', error);
        return {
          profile: null,
          error: error.message || 'Unable to load caregiver profile.',
        };
      }

      return { profile: (data as CaregiverProfile) || null, error: null };
    } catch (err) {
      console.error('[ProfileService] Unexpected error fetching profile:', err);
      return {
        profile: null,
        error: err instanceof Error ? err.message : 'Unexpected profile lookup failure.',
      };
    }
  }

  /**
   * Updates fields on the authenticated caregiver's profile.
   */
  public async updateMyProfile(
    userId: string,
    updates: UpdateProfilePayload
  ): Promise<{ profile: CaregiverProfile | null; error: string | null }> {
    if (!envConfig.isSupabaseConfigured) {
      return {
        profile: null,
        error: 'Supabase credentials not configured in environment.',
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...(updates.fullName !== undefined ? { full_name: updates.fullName } : {}),
          ...(updates.age !== undefined ? { age: updates.age } : {}),
          ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
          ...(updates.relationshipToPatient !== undefined
            ? { relationship_to_patient: updates.relationshipToPatient }
            : {}),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[ProfileService] Error updating profile:', error);
        return { profile: null, error: error.message || 'Unable to update profile.' };
      }

      return { profile: data as CaregiverProfile, error: null };
    } catch (err) {
      return {
        profile: null,
        error: err instanceof Error ? err.message : 'Unexpected profile update failure.',
      };
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
