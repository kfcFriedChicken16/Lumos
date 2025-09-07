"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { apiClient, supabase, type User, type Profile, type Message } from '@/lib/api';
import { finishPendingStudentProfileIfAny } from '@/lib/student-profile';
import { finishPendingVolunteerProfileIfAny } from '@/lib/volunteer-profile';

// Types are now imported from api.ts

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRole: string | null;
  recentMessages: Message[];
  loading: boolean;
  accessToken: string | null;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  determineUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loadUserData = async (userId: string) => {
    try {
      console.log('🔄 AuthContext: Loading user data for:', userId);
      
      // Load profile
      const profileResult = await apiClient.getProfile(userId);
      console.log('📊 AuthContext: Profile result:', profileResult);
      
      if (profileResult.data) {
        console.log('✅ AuthContext: Setting profile:', profileResult.data);
        setProfile(profileResult.data);
      } else {
        console.log('ℹ️ AuthContext: No profile data found, setting profile to null');
        
        // Try to complete any pending profiles (requires an auth session)
        try {
          const studentFinished = await finishPendingStudentProfileIfAny();
          if (studentFinished) {
            console.log('✅ AuthContext: Finished pending student profile');
            const refreshed = await apiClient.getProfile(userId);
            if (refreshed.data) setProfile(refreshed.data);
          }

          const volunteerFinished = await finishPendingVolunteerProfileIfAny();
          if (volunteerFinished) {
            console.log('✅ AuthContext: Finished pending volunteer profile');
            const refreshed = await apiClient.getProfile(userId);
            if (refreshed.data) setProfile(refreshed.data);
          }
        } catch (e) {
          console.error('Error finishing pending profiles:', e);
        }
      }

      // Load recent messages - commented out until messages table exists
      // const messagesResult = await apiClient.getRecentMessages(userId, 5);
      // if (messagesResult.data) {
      //   setRecentMessages(messagesResult.data);
      // }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;
    let tabFocusTimeout: NodeJS.Timeout;
    
    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const applySession = async (session: any) => {
      if (!isMounted) return;
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setRecentMessages([]);
        setAccessToken(null);
        setLoading(false); // Important: Set loading to false when no session
        return;
      }

      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name,
        created_at: session.user.created_at,
      };

      setUser(userData);
      setAccessToken(session.access_token);

      // Only show loading on first initialization
      if (!hasInitialized) {
        setLoading(true);
      }
      
      try {
        await loadUserData(session.user.id);
        // Determine user role after loading user data
        if (isMounted) {
          await determineUserRole();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          hasInitialized = true;
        }
      }
    };

    // Handle tab focus/blur to prevent unnecessary re-initialization
    const handleTabFocus = () => {
      // Clear any pending focus timeout
      if (tabFocusTimeout) {
        clearTimeout(tabFocusTimeout);
      }
      
      // Only re-check auth if we don't have user data
      if (!user && !profile) {
        tabFocusTimeout = setTimeout(async () => {
          if (isMounted && !user && !profile) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && !user) {
              await applySession(session);
            }
          }
        }, 100); // Small delay to prevent rapid re-checks
      }
    };

    const handleTabBlur = () => {
      // Clear focus timeout when tab loses focus
      if (tabFocusTimeout) {
        clearTimeout(tabFocusTimeout);
      }
    };

    // Initial session check
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await applySession(session);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Update token if it was refreshed
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          setAccessToken(session.access_token);
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await applySession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setUserRole(null);
          setRecentMessages([]);
          setAccessToken(null);
        }
      }
    );

    // Add tab focus/blur listeners
    window.addEventListener('focus', handleTabFocus);
    window.addEventListener('blur', handleTabBlur);

    return () => {
      isMounted = false;
      hasInitialized = false;
      if (tabFocusTimeout) {
        clearTimeout(tabFocusTimeout);
      }
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      window.removeEventListener('focus', handleTabFocus);
      window.removeEventListener('blur', handleTabBlur);
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await apiClient.signUp(email, password);
      
      if (result.success) {
        // User will be set via auth state change listener
        // Role will be determined automatically when user data loads
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await apiClient.signIn(email, password);
      
      if (result.success) {
        // User will be set via auth state change listener
        // Role will be determined automatically when user data loads
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AuthContext: Starting signout process');
      setLoading(true);
      
      // Always clear state immediately for instant feedback
      setUser(null);
      setProfile(null);
      setUserRole(null);
      setRecentMessages([]);
      setAccessToken(null);
      
      console.log('✅ AuthContext: Local state cleared');
      
      // Then call Supabase signout
      const result = await apiClient.signOut();
      console.log('📊 AuthContext: Supabase signout result:', result);
      
      // Force redirect to login page immediately after signout
      if (typeof window !== 'undefined') {
        window.location.href = '/web/login';
      }
      
    } catch (error) {
      console.error('❌ AuthContext: Error signing out:', error);
      // State is already cleared above, so this is fine
      // Still redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/web/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      console.log('🔄 AuthContext: updateProfile called');
      console.log('👤 AuthContext: Current user:', user);
      console.log('📝 AuthContext: Profile data:', profileData);

      if (!user) {
        console.error('❌ AuthContext: No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      console.log('🚀 AuthContext: Calling apiClient.updateProfile');
      const result = await apiClient.updateProfile(user.id, profileData);
      
      console.log('📊 AuthContext: API result:', result);

      if (result.success && result.data) {
        console.log('✅ AuthContext: Setting profile in state:', result.data);
        setProfile(result.data);
        return { success: true };
      } else {
        console.error('❌ AuthContext: Profile update failed:', result.error);
        return { success: false, error: result.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('💥 AuthContext: Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile update failed' 
      };
    }
  };

  const determineUserRole = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      console.log('🔍 AuthContext: Determining user role for:', user.id);
      
      // Check if user has a role in user_roles table
      const roleResult = await apiClient.getUserRole(user.id);
      
      if (roleResult.error) {
        console.log('⚠️ AuthContext: Error fetching user role:', roleResult.error);
        return null;
      }
      
      if (roleResult.data?.role_id) {
        const role = roleResult.data.role_id;
        console.log('✅ AuthContext: User role determined:', role);
        setUserRole(role);
        return role;
      }
      
      console.log('ℹ️ AuthContext: No role found for user');
      return null;
    } catch (error) {
      console.error('❌ AuthContext: Error determining user role:', error);
      return null;
    }
  };

  // updatePreferences removed - can be added back later

  // Profile creation now handled by dedicated functions in lib/student-profile.ts and lib/volunteer-profile.ts

  // Memoize context value to reduce unnecessary re-renders
  const contextValue = useMemo(() => ({
    user, 
    profile, 
    userRole,
    recentMessages, 
    loading, 
    accessToken, 
    signUp, 
    signIn, 
    signOut, 
    updateProfile,
    determineUserRole
  }), [user, profile, userRole, recentMessages, loading, accessToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
