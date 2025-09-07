import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log(`🔗 Connecting to Supabase Auth: ${supabaseUrl}`);

// Regular client for standard operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for operations that need to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types for new schema
export interface UserProfile {
  user_id: string;
  public_id: string;
  name?: string;
  phone?: string;
  age?: number;
  mbti?: string;
  extras: any;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  preferences: any;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  title?: string;
  meta: any;
}

export interface UserMessage {
  id: number;
  user_id: string;
  session_id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts: string;
  idx: number;
}

export interface SessionAnalytics {
  id: number;
  session_id: string;
  user_id: string;
  emotion?: string;
  tokens_used?: number;
  duration_sec?: number;
  metrics: any;
  created_at: string;
}

// Simplified Academic feature interfaces
export interface AcademicProject {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  subject?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  project_id: string;
  planned_date: string;
  start_time?: string;
  duration_minutes: number;
  task_description: string;
  completed: boolean;
  actual_duration?: number;
  productivity_score?: number; // 1-10
  notes?: string; // Post-study reflection
  created_at: string;
}

// Use case types for multi-dimensional analysis
export type UseCase =
  | 'vendor_announcement'       // "Is this officially announced / what do they say?"
  | 'technical_doc'             // implementation details
  | 'academic_evidence'         // peer-review style credibility
  | 'news_reporting'
  | 'general_info';

// Enhanced analysis interface (no database storage)
export interface ResourceAnalysis {
  credibility: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestions: string[];
  key_points?: string[];
  potential_issues?: string[];
  // Enhanced fields
  confidence?: number; // 0..1
  breakdown?: {
    officialness: number;       // 0..1
    evidence_rigor: number;     // 0..1 (peer review, citations)
    independence: number;       // 0..1 (COI/bias)
    verifiability: number;      // 0..1 (links/DOIs)
  };
  credibility_by_use?: Record<UseCase, 'high'|'medium'|'low'>;
}

export interface LearningAnalysis {
  knowledge_gaps: string[];
  suggested_resources: Array<{
    title: string;
    url?: string;
    type: 'video' | 'article' | 'book' | 'course';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  study_plan_suggestions: string[];
  estimated_time: string;
}

export class SupabaseAuthService {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Supabase Auth connection...');
      
      // Test connection by checking if user_roles table exists (part of new schema)
      const { data, error } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }

      console.log('✅ Supabase Auth connection successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  // User registration
  async signUp(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      console.log(`📝 Attempting to sign up user: ${email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        return { user: null, error };
      }

      if (data.user) {
        console.log(`✅ User signed up successfully: ${data.user.id}`);
        
        // Create profile and preferences for new user
        await this.ensureUserProfile(data.user.id);
        await this.ensureUserPreferences(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { user: null, error };
    }
  }

  // User login
  async signIn(email: string, password: string): Promise<{ user: any; session: any; error: any }> {
    try {
      console.log(`📝 Attempting to sign in user: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { user: null, session: null, error };
      }

      if (data.user) {
        console.log(`✅ User signed in successfully: ${data.user.id}`);
        
        // Ensure profile and preferences exist
        await this.ensureUserProfile(data.user.id);
        await this.ensureUserPreferences(data.user.id);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { user: null, session: null, error };
    }
  }

  // User logout
  async signOut(): Promise<{ error: any }> {
    try {
      console.log('📝 Attempting to sign out user');
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        return { error };
      }

      console.log('✅ User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<{ user: any; error: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Get current user error:', error);
        return { user: null, error };
      }

      return { user, error: null };
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return { user: null, error };
    }
  }

  // Ensure user profile exists (updated for new role-based schema)
  async ensureUserProfile(userId: string): Promise<void> {
    try {
      // Check if user has a role assigned
      const { data: existingRole } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingRole) {
        console.log(`📝 No role found for user: ${userId} - profile will be created during signup`);
        return;
      }

      console.log(`✅ User ${userId} has role: ${existingRole.role_id}`);
      // Profile creation is now handled during signup process
    } catch (error) {
      console.error('❌ Error checking user role:', error);
    }
  }

  // Ensure user preferences exist
  async ensureUserPreferences(userId: string): Promise<void> {
    try {
      const { data: existingPrefs } = await supabaseAdmin
        .from('user_preferences')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle(); // Fixed: use maybeSingle instead of single

      if (!existingPrefs) {
        console.log(`📝 Creating preferences for user: ${userId}`);
        
        const { error } = await supabaseAdmin
          .from('user_preferences')
          .insert([{ 
            user_id: userId,
            preferences: {
              theme: "dark",
              voice_enabled: true,
              notifications: true,
              study_reminders: true,
              mood_tracking: true,
              directness: 3
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('❌ Error creating preferences:', error);
        } else {
          console.log(`✅ Preferences created for user: ${userId}`);
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring user preferences:', error);
    }
  }

  // Get user profile (updated for new role-based schema)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`🔍 Getting profile for user: ${userId}`);
      
      // First get user role
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();

      if (roleError || !roleData) {
        console.log('📝 No role found for user:', userId);
        return null;
      }

      const role = roleData.role_id;
      let profileData;
      let profileError;

      // Get profile from appropriate role-specific table
      if (role === 'student') {
        const result = await supabaseAdmin
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else if (role === 'volunteer') {
        const result = await supabaseAdmin
          .from('volunteer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else if (role === 'teacher') {
        const result = await supabaseAdmin
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        profileData = result.data;
        profileError = result.error;
      } else {
        console.log('📝 Unknown role for user:', userId);
        return null;
      }

      if (profileError) {
        console.error('❌ Error getting user profile:', profileError);
        return null;
      }

      if (!profileData) {
        console.log('📝 No profile found for user:', userId);
        return null;
      }

      // Transform to match UserProfile interface
      const transformedProfile = {
        user_id: profileData.user_id,
        public_id: profileData.user_id,
        name: profileData.full_name,
        bio: profileData.goals || profileData.experience || null,
        extras: {
          phone: profileData.phone,
          school: profileData.school || null,
          subjects: profileData.subjects || profileData.skills || [],
          goals: profileData.goals || null,
          experience: profileData.experience || null
        },
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      console.log('✅ Profile loaded for user:', userId);
      return transformedProfile;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile (updated for new role-based schema)
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      // First get user role
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();

      if (roleError || !roleData) {
        console.error('❌ No role found for user:', userId);
        throw new Error('User role not found');
      }

      const role = roleData.role_id;
      let tableName;
      let profileData;

      // Prepare profile data for the appropriate role-specific table
      if (role === 'student') {
        tableName = 'student_profiles';
        profileData = {
          full_name: profile.name,
          phone: profile.extras?.phone,
          school: profile.extras?.school,
          subjects: profile.extras?.subjects,
          goals: profile.extras?.goals || null,
          updated_at: new Date().toISOString()
        };
      } else if (role === 'volunteer') {
        tableName = 'volunteer_profiles';
        profileData = {
          full_name: profile.name,
          phone: profile.extras?.phone,
          skills: profile.extras?.subjects,
          experience: profile.extras?.experience || null,
          updated_at: new Date().toISOString()
        };
      } else if (role === 'teacher') {
        tableName = 'teacher_profiles';
        profileData = {
          full_name: profile.name,
          phone: profile.extras?.phone,
          subjects: profile.extras?.subjects,
          updated_at: new Date().toISOString()
        };
      } else {
        console.error('❌ Unknown role for user:', userId);
        throw new Error('Unknown user role');
      }

      const { error } = await supabaseAdmin
        .from(tableName)
        .update(profileData)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating user profile:', error);
        throw error;
      }

      console.log(`✅ Profile updated for user: ${userId} in ${tableName}`);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      console.log(`🔍 Getting preferences for user: ${userId}`);
      
      const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Fixed: use maybeSingle instead of single

      if (error) {
        console.error('❌ Error getting user preferences:', error);
        return null;
      }

      if (!data) {
        console.log('📝 No preferences found for user:', userId, '- using defaults');
        return null;
      }

      console.log('✅ Preferences loaded for user:', userId);
      return data;
    } catch (error) {
      console.error('❌ Error getting user preferences:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating user preferences:', error);
        throw error;
      }

      console.log(`✅ Preferences updated for user: ${userId}`);
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      throw error;
    }
  }

  // Create new session
  async createSession(userId: string, title?: string, meta?: any): Promise<UserSession | null> {
    try {
      console.log(`📝 Creating session for user ${userId}: ${title}`);
      
      const sessionData = {
        user_id: userId,
        title: title || `Lumos • ${new Date().toLocaleDateString()}`,
        meta: meta || {}
      };

      const { data, error } = await supabaseAdmin
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating session:', error);
        return null;
      }

      console.log(`✅ Session created: ${data.id} for user ${userId}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      return null;
    }
  }

  // Insert message using RPC
  async insertMessage(role: 'user' | 'assistant' | 'system', content: string, sessionId?: string): Promise<number | null> {
    try {
      const { data, error } = await supabase.rpc('insert_message_with_idx', {
        p_role: role,
        p_content: content,
        p_session_id: sessionId
      });

      if (error) {
        console.error('❌ Error inserting message:', error);
        return null;
      }

      console.log(`✅ Message inserted with ID: ${data}`);
      return data;
    } catch (error) {
      console.error('❌ Error inserting message:', error);
      return null;
    }
  }

  // Insert message for specific user
  async insertMessageForUser(userId: string, role: 'user' | 'assistant' | 'system', content: string, sessionId?: string): Promise<number | null> {
    try {
      console.log(`📝 Inserting message for user ${userId}: ${role} - ${content.substring(0, 50)}...`);

      // Get the next index for this user
      const { data: lastMessage } = await supabaseAdmin
        .from('messages')
        .select('idx')
        .eq('user_id', userId)
        .order('idx', { ascending: false })
        .limit(1)
        .maybeSingle(); // Fixed: use maybeSingle instead of single

      const nextIdx = (lastMessage?.idx || 0) + 1;
      console.log(`📝 Next message index for user ${userId}: ${nextIdx}`);

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert([{
          user_id: userId,
          role: role,
          content: content,
          session_id: sessionId,
          idx: nextIdx
        }])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error inserting message for user:', error);
        return null;
      }

      console.log(`✅ Message inserted for user ${userId} with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('❌ Error inserting message for user:', error);
      return null;
    }
  }

  // Get recent messages for user
  async getRecentMessages(userId: string, limit: number = 50): Promise<UserMessage[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('ts', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting recent messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting recent messages:', error);
      return [];
    }
  }

  // Get user's Jarvis context (profile + preferences + recent messages)
  async getJarvisContext(userId: string): Promise<{
    profile: UserProfile | null;
    preferences: UserPreferences | null;
    recentMessages: UserMessage[];
  }> {
    try {
      console.log(`🎭 Getting Jarvis context for user: ${userId}`);
      
      const [profile, preferences, recentMessages] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserPreferences(userId),
        this.getRecentMessages(userId, 20) // Last 20 messages for context
      ]);

      return {
        profile,
        preferences,
        recentMessages: recentMessages.reverse() // Chronological order
      };
    } catch (error) {
      console.error('❌ Error getting Jarvis context:', error);
      return {
        profile: null,
        preferences: null,
        recentMessages: []
      };
    }
  }

  // Store session analytics
  async storeSessionAnalytics(sessionId: string, userId: string, analytics: {
    emotion?: string;
    tokens_used?: number;
    duration_sec?: number;
    metrics?: any;
  }): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('session_analytics')
        .insert([{
          session_id: sessionId,
          user_id: userId,
          ...analytics
        }]);

      if (error) {
        console.error('❌ Error storing session analytics:', error);
        throw error;
      }

      console.log(`✅ Session analytics stored for session: ${sessionId}`);
    } catch (error) {
      console.error('❌ Error storing session analytics:', error);
      throw error;
    }
  }

  // ===== SIMPLIFIED ACADEMIC FEATURES =====

  // Create academic project
  async createAcademicProject(userId: string, projectData: Partial<AcademicProject>): Promise<AcademicProject | null> {
    try {
      console.log(`📚 Creating academic project for user: ${userId}`);
      
      const { data, error } = await supabaseAdmin
        .from('academic_projects')
        .insert([{
          user_id: userId,
          ...projectData,
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Error creating academic project:', error);
        return null;
      }

      console.log(`✅ Academic project created: ${data?.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating academic project:', error);
      return null;
    }
  }

  // Get user's academic projects
  async getUserProjects(userId: string, status?: string): Promise<AcademicProject[]> {
    try {
      let query = supabaseAdmin
        .from('academic_projects')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error getting user projects:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting user projects:', error);
      return [];
    }
  }

  // Update academic project
  async updateAcademicProject(projectId: string, userId: string, updates: Partial<AcademicProject>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('academic_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating academic project:', error);
        return false;
      }

      console.log(`✅ Academic project updated: ${projectId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating academic project:', error);
      return false;
    }
  }

  // Create study plan
  async createStudyPlan(userId: string, planData: Partial<StudyPlan>): Promise<StudyPlan | null> {
    try {
      console.log(`📅 Creating study plan for user: ${userId}`);
      
      const { data, error } = await supabaseAdmin
        .from('study_plans')
        .insert([{
          user_id: userId,
          ...planData,
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Error creating study plan:', error);
        return null;
      }

      console.log(`✅ Study plan created: ${data?.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating study plan:', error);
      return null;
    }
  }

  // Get upcoming study plans
  async getUpcomingStudyPlans(userId: string, days: number = 7): Promise<StudyPlan[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabaseAdmin
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('planned_date', new Date().toISOString().split('T')[0])
        .lte('planned_date', endDate.toISOString().split('T')[0])
        .order('planned_date', { ascending: true });

      if (error) {
        console.error('❌ Error getting upcoming study plans:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting upcoming study plans:', error);
      return [];
    }
  }

  // Update study plan (mark complete, add notes, etc.)
  async updateStudyPlan(planId: string, userId: string, updates: Partial<StudyPlan>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('study_plans')
        .update(updates)
        .eq('id', planId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating study plan:', error);
        return false;
      }

      console.log(`✅ Study plan updated: ${planId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating study plan:', error);
      return false;
    }
  }

  // Get simplified academic context for AI (just projects and plans)
  async getAcademicContext(userId: string): Promise<{
    projects: AcademicProject[];
    upcomingPlans: StudyPlan[];
  }> {
    try {
      console.log(`🎓 Getting academic context for user: ${userId}`);
      
      const [projects, upcomingPlans] = await Promise.all([
        this.getUserProjects(userId),
        this.getUpcomingStudyPlans(userId)
      ]);

      return {
        projects,
        upcomingPlans
      };
    } catch (error) {
      console.error('❌ Error getting academic context:', error);
      return {
        projects: [],
        upcomingPlans: []
      };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();