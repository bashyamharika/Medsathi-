import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase.js';
import { profileService } from './profileService.js';
import { envConfig } from '../config/env.js';
import type {
  SignUpFormData,
  SignInFormData,
  AuthResult,
  CaregiverProfile,
} from '../types/index.js';

export interface SignUpResponseData {
  user: User | null;
  session: Session | null;
  profile: CaregiverProfile | null;
  requiresEmailConfirmation: boolean;
}

export class AuthService {
  /**
   * Helper to transform Supabase auth error codes/messages into empathetic,
   * human-friendly explanations for healthcare users.
   */
  public formatAuthError(error: Error | { message?: string; status?: number }): string {
    const msg = (error.message || '').toLowerCase();

    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('invalid grant')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (msg.includes('email not confirmed') || msg.includes('email address not confirmed') || msg.includes('email_not_confirmed')) {
      return 'Please verify your email before signing in. A confirmation link was sent to your inbox.';
    }
    if (msg.includes('password should be at least') || msg.includes('weak_password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('invalid format') || msg.includes('valid email') || msg.includes('invalid_email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
      return 'Too many login attempts. Please wait a few moments before trying again.';
    }
    if (msg.includes('signup_disabled') || msg.includes('signups not allowed')) {
      return 'Account registration is currently disabled by system policy.';
    }
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network error')) {
      return 'Unable to reach the server. Please check your network connection.';
    }

    return 'Something went wrong. Please check your details and try again.';
  }

  /**
   * Registers a new caregiver account with Supabase Auth and establishes their profile.
   */
  public async signUp(formData: SignUpFormData): Promise<AuthResult<SignUpResponseData>> {
    if (!envConfig.isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase project is not yet configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    try {
      const parsedAge = formData.age ? parseInt(formData.age, 10) : null;
      const validAge = isNaN(parsedAge as number) ? null : parsedAge;

      // 1. Supabase Auth registration with complete user metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            role: 'caregiver',
            age: validAge,
            phone: formData.phone.trim() || null,
            relationship_to_patient: formData.relationshipToPatient.trim() || null,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: this.formatAuthError(authError),
        };
      }

      const authUser = authData.user;
      if (!authUser) {
        return {
          success: false,
          error: 'Registration failed: Unable to create account.',
        };
      }

      // Check if Supabase requires email verification (session is null when email confirmation is required)
      const requiresEmailConfirmation = !authData.session;

      // 2. Create Caregiver Profile record in public.profiles (only if active session exists)
      let profile: CaregiverProfile | null = null;
      if (!requiresEmailConfirmation) {
        const { profile: createdProfile, error: profileError } = await profileService.createProfile({
          userId: authUser.id,
          fullName: formData.fullName.trim(),
          age: validAge,
          phone: formData.phone.trim() || null,
          relationshipToPatient: formData.relationshipToPatient.trim() || null,
        });

        profile = createdProfile;

        if (profileError) {
          console.warn('[AuthService] Auth account created but profile insertion encountered an issue:', profileError);
          return {
            success: true,
            data: {
              user: authUser,
              session: authData.session,
              profile: null,
              requiresEmailConfirmation: false,
            },
            error: 'Your account was created, but we could not save all profile details right away. You can update them in your dashboard.',
          };
        }
      }

      return {
        success: true,
        requiresEmailConfirmation,
        data: {
          user: authUser,
          session: authData.session,
          profile,
          requiresEmailConfirmation,
        },
      };
    } catch (err) {
      console.error('[AuthService] Unexpected error during signUp:', err);
      return {
        success: false,
        error: err instanceof Error ? this.formatAuthError(err) : 'An unexpected error occurred during registration.',
      };
    }
  }

  /**
   * Signs in an existing caregiver with email and password.
   */
  public async signIn(
    formData: SignInFormData
  ): Promise<AuthResult<{ user: User; session: Session }>> {
    if (!envConfig.isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase project is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Authentication failed. Please verify your credentials.',
        };
      }

      return {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      };
    } catch (err) {
      console.error('[AuthService] Unexpected error during signIn:', err);
      return {
        success: false,
        error: err instanceof Error ? this.formatAuthError(err) : 'Unable to sign in. Please try again.',
      };
    }
  }

  /**
   * Signs out the current user and clears active session.
   */
  public async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Error signing out.',
      };
    }
  }

  /**
   * Retrieves active Supabase session.
   */
  public async getCurrentSession(): Promise<Session | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves active Supabase authenticated user.
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
