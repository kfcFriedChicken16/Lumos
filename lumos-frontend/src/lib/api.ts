import { createClient } from '@supabase/supabase-js'

// Supabase configuration - use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Use localhost for development, public IP for production
const backendUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : 'http://203.217.131.163:3001'

// Create Supabase client with sessionStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        try {
          return sessionStorage.getItem(key);
        } catch (error) {
          console.error('Error getting item from sessionStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item in sessionStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from sessionStorage:', error);
        }
      }
    } : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Types for API responses
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface Profile {
  user_id?: string;
  public_id?: string;
  name?: string;
  phone?: string;
  age?: number;
  mbti?: string;
  bio?: string;
  extras?: any;
  created_at?: string;
  updated_at?: string;
}

// Preferences interface removed - can be added back later

export interface Message {
  id: number;
  user_id: string;
  session_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts: string;
  idx: number;
}

export interface MoodEntry {
  id?: string;
  user_id: string;
  mood: string;
  notes?: string;
  created_at?: string;
}

export interface StudySession {
  id?: string;
  user_id: string;
  subject?: string;
  duration_minutes: number;
  completed: boolean;
  created_at?: string;
}

// API Client class
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = backendUrl) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { data: null, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Authentication methods using Supabase directly
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signout failed' 
      };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error: error.message };
      }
      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  // Profile management
  async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      console.log('🔍 API: Getting profile for user:', userId);
      
      // First, get the user's role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();

      if (roleError || !roleData) {
        console.log('ℹ️ API: No role found for user, returning null profile');
        return { data: null, error: null };
      }

      const role = roleData.role_id;
      console.log('🔍 API: User role:', role);

      // Get profile from the appropriate role-specific table
      let profileData;
      let profileError;

      if (role === 'student') {
        const result = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else if (role === 'volunteer') {
        const result = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else if (role === 'teacher') {
        const result = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else {
        console.log('ℹ️ API: Unknown role:', role);
        return { data: null, error: null };
      }

      if (profileError) {
        console.error('❌ API: Error fetching profile:', profileError);
        return { data: null, error: profileError.message };
      }

      if (!profileData) {
        console.log('ℹ️ API: No profile found for user');
        return { data: null, error: null };
      }

      // Transform the data to match the existing Profile interface
      const transformedData = {
        id: profileData.id,
        user_id: profileData.user_id,
        name: profileData.full_name,
        bio: profileData.goals || profileData.experience || null,
        extras: {
          phone: profileData.phone,
          school: profileData.school || null,
          subjects: profileData.subjects || profileData.skills || [],
          location: null, // Not in new schema yet
          goals: profileData.goals || null,
          experience: profileData.experience || null
        },
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      console.log('✅ API: Profile retrieved successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get profile' 
      };
    }
  }

  async updateProfile(userId: string, profile: Partial<Profile>) {
    try {
      console.log('🔄 API: Updating profile for user:', userId);
      console.log('📝 API: Profile data:', profile);

      // First, get the user's role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();

      if (roleError || !roleData) {
        console.error('❌ API: No role found for user');
        return { success: false, error: 'User role not found' };
      }

      const role = roleData.role_id;
      console.log('🔍 API: User role:', role);

      // Prepare profile data for the appropriate role-specific table
      let profileToSave;
      let tableName;

      if (role === 'student') {
        tableName = 'student_profiles';
        profileToSave = {
          user_id: userId,
          full_name: profile.name,
          phone: profile.extras?.phone,
          school: profile.extras?.school,
          subjects: profile.extras?.subjects,
          goals: profile.extras?.goals || profile.bio,
          updated_at: new Date().toISOString(),
        };
      } else if (role === 'volunteer') {
        tableName = 'volunteer_profiles';
        profileToSave = {
          user_id: userId,
          full_name: profile.name,
          phone: profile.extras?.phone,
          skills: profile.extras?.subjects,
          experience: profile.extras?.experience || profile.bio,
          updated_at: new Date().toISOString(),
        };
      } else if (role === 'teacher') {
        tableName = 'teacher_profiles';
        profileToSave = {
          user_id: userId,
          full_name: profile.name,
          phone: profile.extras?.phone,
          subjects: profile.extras?.subjects,
          updated_at: new Date().toISOString(),
        };
      } else {
        console.error('❌ API: Unknown role:', role);
        return { success: false, error: 'Unknown user role' };
      }

      console.log('💾 API: Data being sent to Supabase:', profileToSave);

      const { data, error } = await supabase
        .from(tableName)
        .upsert(profileToSave)
        .select()
        .single();

      if (error) {
        console.error('❌ API: Supabase error:', error);
        return { success: false, error: error.message };
      }

      // Transform the response to match the existing Profile interface
      const transformedData = {
        id: data.id,
        user_id: data.user_id,
        name: data.full_name,
        bio: data.goals || data.experience || null,
        extras: {
          phone: data.phone,
          school: data.school || null,
          subjects: data.subjects || data.skills || [],
          location: null,
          goals: data.goals || null,
          experience: data.experience || null
        },
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('✅ API: Profile updated successfully:', transformedData);
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('💥 API: Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }

  // Preferences removed for now - can be added back later

  // Mood tracking
  async saveMoodEntry(userId: string, mood: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: userId,
          mood,
          notes,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save mood entry' 
      };
    }
  }

  async getMoodEntries(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get mood entries' 
      };
    }
  }

  // Study session tracking
  async saveStudySession(userId: string, session: Omit<StudySession, 'id' | 'user_id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: userId,
          ...session,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save study session' 
      };
    }
  }

  async getStudySessions(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get study sessions' 
      };
    }
  }

  // Recent messages
  async getRecentMessages(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('ts', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get recent messages' 
      };
    }
  }

  // User role management
  async getUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get user role' 
      };
    }
  }

  async createUserRole(userId: string, roleId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role_id: roleId }])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create user role' 
      };
    }
  }

  // Profile management for different roles
  async createStudentProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .insert([{ user_id: userId, ...profileData }])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create student profile' 
      };
    }
  }

  async createVolunteerProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('volunteer_profiles')
        .insert([{ user_id: userId, ...profileData }])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create volunteer profile' 
      };
    }
  }

  // LLM Chat functionality
  async generateLLMResponse(message: string, userId?: string, userPreferences?: any) {
    try {
      console.log('🤖 API: Generating LLM response for:', message.substring(0, 100) + '...');
      
      const response = await fetch(`${this.baseUrl}/api/llm/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          userPreferences,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API: LLM backend error:', response.status, errorText);
        return { 
          data: null, 
          error: `LLM backend error: ${response.status} - ${errorText}` 
        };
      }

      const data = await response.json();
      console.log('✅ API: LLM response received successfully');
      return { data, error: null };
    } catch (error) {
      console.error('💥 API: LLM request failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get LLM response' 
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
