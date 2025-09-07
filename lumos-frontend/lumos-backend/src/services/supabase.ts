import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL!;
// Use SERVICE ROLE key for backend operations (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

console.log(`🔗 Connecting to Supabase: ${supabaseUrl}`);
console.log(`🔑 Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE ROLE' : 'ANON'}`);

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Session {
  id: string;
  created_at: string;
  last_active: string;
  total_messages: number;
  emotional_state?: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  user_message: string;
  assistant_response: string;
  emotion_detected?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  session_id: string;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Supabase connection...');
      
      // Try to insert a test record with proper UUID
      const testSession = {
        id: uuidv4(), // Generate a proper UUID
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        total_messages: 1
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert([testSession])
        .select();

      if (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }

      console.log('✅ Connection test successful:', data);
      
      // Clean up test record
      await supabase
        .from('sessions')
        .delete()
        .eq('id', testSession.id);

      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  // Create or get existing session
  async createOrGetSession(sessionId: string): Promise<Session> {
    try {
      console.log(`📝 Attempting to create/get session: ${sessionId}`);
      
      // Check if session exists
      const { data: existingSession, error: selectError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Error checking existing session:', selectError);
        throw selectError;
      }

      if (existingSession) {
        console.log(`📝 Found existing session:`, existingSession);
        
        // Update last active time
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ 
            last_active: new Date().toISOString(),
            total_messages: existingSession.total_messages + 1
          })
          .eq('id', sessionId);

        if (updateError) {
          console.error('❌ Error updating session:', updateError);
          throw updateError;
        }

        console.log(`✅ Updated existing session: ${sessionId}`);
        return existingSession;
      }

      console.log(`📝 Creating new session: ${sessionId}`);
      
      // Create new session
      const newSession: Partial<Session> = {
        id: sessionId,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        total_messages: 1
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating session:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`✅ Successfully created new session:`, data);
      return data;
    } catch (error) {
      console.error('❌ Error creating/getting session:', error);
      // Return a fallback session object
      return {
        id: sessionId,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        total_messages: 1
      };
    }
  }

  // Store conversation
  async storeConversation(
    sessionId: string, 
    userMessage: string, 
    assistantResponse: string, 
    emotionDetected?: string
  ): Promise<void> {
    try {
      console.log(`📝 Attempting to store conversation for session: ${sessionId}`);
      console.log(`📝 User message: "${userMessage.substring(0, 50)}..."`);
      console.log(`📝 Assistant response: "${assistantResponse.substring(0, 50)}..."`);
      
      const conversation: Partial<Conversation> = {
        session_id: sessionId,
        user_message: userMessage,
        assistant_response: assistantResponse,
        emotion_detected: emotionDetected,
        created_at: new Date().toISOString()
      };

      console.log(`📝 Conversation object:`, conversation);

      const { data, error } = await supabase
        .from('conversations')
        .insert([conversation])
        .select(); // Add .select() to get the inserted data

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`✅ Successfully stored conversation:`, data);
    } catch (error) {
      console.error('❌ Error storing conversation:', error);
      // Re-throw the error so calling code knows it failed
      throw error;
    }
  }

  // Get conversation history for a session
  async getConversationHistory(sessionId: string, limit: number = 10): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  // Get user preferences
  async getUserPreferences(sessionId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(
    sessionId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      if (existing) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);

        if (error) throw error;
      } else {
        // Create new preferences
        const newPreferences: Partial<UserPreferences> = {
          session_id: sessionId,
          language: preferences.language || 'en',
          topics: preferences.topics || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('user_preferences')
          .insert([newPreferences]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // Get session analytics
  async getSessionAnalytics(sessionId: string): Promise<any> {
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('emotion_detected, created_at')
        .eq('session_id', sessionId);

      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      // Analyze emotions
      const emotions = conversations?.map(c => c.emotion_detected).filter(Boolean) || [];
      const emotionCounts = emotions.reduce((acc: any, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      return {
        totalMessages: session?.total_messages || 0,
        sessionDuration: session ? 
          new Date(session.last_active).getTime() - new Date(session.created_at).getTime() : 0,
        emotionBreakdown: emotionCounts,
        mostFrequentEmotion: Object.keys(emotionCounts).reduce((a, b) => 
          emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
        )
      };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return {
        totalMessages: 0,
        sessionDuration: 0,
        emotionBreakdown: {},
        mostFrequentEmotion: 'neutral'
      };
    }
  }

  // Clean up old sessions (optional)
  async cleanupOldSessions(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('sessions')
        .delete()
        .lt('last_active', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }
}

export const supabaseService = new SupabaseService();
