import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.js';
import { authService, type SignUpResponseData } from '../services/authService.js';
import { profileService } from '../services/profileService.js';
import type {
  CaregiverProfile,
  SignUpFormData,
  SignInFormData,
  AuthResult,
} from '../types/index.js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CaregiverProfile | null;
  loading: boolean;
  signUp: (data: SignUpFormData) => Promise<AuthResult<SignUpResponseData>>;
  signIn: (data: SignInFormData) => Promise<AuthResult<{ user: User; session: Session }>>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CaregiverProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to fetch the Caregiver profile for a given user ID
  // Helper to fetch or auto-provision the Caregiver profile for a given user
  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      const { profile: loadedProfile, error } = await profileService.getMyProfile(userId);
      if (error) {
        console.warn('[AuthContext] Unable to load profile:', error);
      }

      if (loadedProfile) {
        setProfile(loadedProfile);
        return;
      }

      // If user is authenticated but profile row does not exist yet (e.g. after confirming email),
      // auto-provision profile from auth metadata
      if (currentUser) {
        const meta = currentUser.user_metadata || {};
        const metaAge = meta.age ? parseInt(meta.age, 10) : null;
        const { profile: createdProfile } = await profileService.createProfile({
          userId: currentUser.id,
          fullName: meta.full_name || currentUser.email?.split('@')[0] || 'Caregiver',
          age: isNaN(metaAge as number) ? null : metaAge,
          phone: meta.phone || null,
          relationshipToPatient: meta.relationship_to_patient || null,
        });

        if (createdProfile) {
          setProfile(createdProfile);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error loading caregiver profile:', err);
    }
  }, []);

  // Initialize session and set up auth state listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          const currentSession = data.session;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Failed to get initial session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh, session expiry)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (data: SignUpFormData): Promise<AuthResult<SignUpResponseData>> => {
    const result = await authService.signUp(data);
    if (result.success && result.data?.session?.user) {
      setUser(result.data.session.user);
      setSession(result.data.session);
      if (result.data.profile) {
        setProfile(result.data.profile);
      }
    }
    return result;
  };

  const signIn = async (
    data: SignInFormData
  ): Promise<AuthResult<{ user: User; session: Session }>> => {
    const result = await authService.signIn(data);
    if (result.success && result.data) {
      setUser(result.data.user);
      setSession(result.data.session);
      await fetchProfile(result.data.user.id, result.data.user);
    }
    return result;
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
