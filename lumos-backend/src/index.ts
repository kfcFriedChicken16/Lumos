import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); // Load environment variables first
console.log('🔍 DEBUG: Loading .env from:', path.resolve(__dirname, '..', '.env'));
console.log('🔍 DEBUG: SUPABASE_URL loaded:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('🔍 DEBUG: OPENROUTER_API_KEY loaded:', process.env.OPENROUTER_API_KEY ? '✅' : '❌');
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { STTService } from './services/stt';
import { LLMService } from './services/llm';
import { TTSService } from './services/tts';
import { supabaseAuthService, supabase as authSupabase } from './services/supabase-auth';
import authRoutes from './routes/auth';
import academicRoutes from './routes/academic';
import llmRoutes from './routes/llm';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for token verification
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to verify token from WebSocket
async function verifyWebSocketToken(token: string): Promise<any> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('❌ WebSocket token verification failed:', error);
      return null;
    }
    
    if (!data.user) {
      console.error('❌ No user found in WebSocket token');
      return null;
    }
    
    console.log(`✅ WebSocket token verified for user: ${data.user.id}`);
    return data.user;
  } catch (error) {
    console.error('❌ WebSocket token verification error:', error);
    return null;
  }
}

// Environment variables already loaded at the top

const app = express();
const server = createServer(app);
const wss = new Server({ server });

// Initialize AI services
const sttService = new STTService();
const llmService = new LLMService();
const ttsService = new TTSService();

// Store active WebSocket sessions (temporary, not database sessions)
const activeWebSocketSessions = new Map<string, { 
  ws: any; 
  sessionId: string; 
  dbSessionId?: string;
  sessionStartedAt?: number;
  lastActive: Date;
  accessToken?: string;
}>();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://lumos-ecru.vercel.app',
    'https://lumos-tutor.vercel.app',
    'https://lumos-tutor-git-main-kfcfriedchicken16.vercel.app'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Register auth routes first
app.use('/api/auth', authRoutes);

// Register academic routes
app.use('/api/academic', academicRoutes);

// Register LLM routes
app.use('/api/llm', llmRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Lumos Backend is running!' });
});

// TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`🎵 Generating TTS for: "${text}"`);
    
    const audioBuffer = await ttsService.textToSpeech(text);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
    
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Webhook endpoint - receives external notifications
app.post('/webhooks/n8n', (req, res) => {
  console.log('📨 Webhook received from n8n:', req.body);
  
  const { event, user_id, message } = req.body;
  
  // Handle different webhook events
  switch(event) {
    case 'study_reminder':
      console.log(`⏰ Study reminder for ${user_id}: ${message}`);
      // TODO: Send notification to user via WebSocket
      break;
    
    case 'mood_checkin':
      console.log(`💭 Mood check-in time for ${user_id}`);
      // TODO: Trigger mood check-in dialog
      break;
    
    case 'deadline_alert':
      console.log(`🚨 Deadline alert for ${user_id}: ${message}`);
      // TODO: Send urgent notification
      break;
    
    default:
      console.log('Unknown webhook event:', event);
  }
  
  // Always respond with success
  res.json({ status: 'Webhook received successfully' });
});

// Example webhook for testing
app.post('/webhooks/test', (req, res) => {
  console.log('🧪 Test webhook received:', req.body);
  res.json({ 
    message: 'Test webhook working!', 
    received_data: req.body 
  });
});

// Voice WebSocket connection
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection for voice session');
  
  let currentSessionId: string = '';
  let currentUserId: string | null = null;
  
  ws.on('message', async (message) => {
    try {
      // Handle different message types
      const messageStr = message.toString();
      const data = JSON.parse(messageStr);
      
      console.log(`📨 Received WebSocket message: ${data.type}`);
        
      if (data.type === 'init_session') {
        console.log('🔄 Initializing voice session...');
        
        // Verify token if provided
        let verifiedUser = null;
        if (data.token) {
          verifiedUser = await verifyWebSocketToken(data.token);
          if (verifiedUser) {
            currentUserId = verifiedUser.id;
            console.log(`✅ WebSocket session authenticated for user: ${currentUserId}`);
            
            // TODO: Set auth token on service client for RLS (requires Supabase client update)
            console.log(`🔐 Auth token verified, RLS policies will be applied`);
          } else {
            console.log('⚠️ Invalid token provided, proceeding as anonymous user');
          }
        } else {
          currentUserId = data.userId || null;
        }
        
        // Create database session if user is authenticated
        let dbSessionId = null;
        if (currentUserId) {
          try {
            const dbSession = await supabaseAuthService.createSession(
              currentUserId,
              "Lumos • Voice Session",
              { 
                channel: "voice", 
                wsId: currentSessionId,
                userAgent: data.userAgent || 'unknown'
              }
            );
            if (dbSession) {
              dbSessionId = dbSession.id;
              console.log(`✅ Database session created: ${dbSessionId}`);
            }
          } catch (error) {
            console.error('❌ Failed to create database session:', error);
          }
        }
        
        // Generate a temporary session ID for this WebSocket connection
        currentSessionId = data.sessionId || uuidv4();
        
        // Store active WebSocket session with database session ID and access token
        activeWebSocketSessions.set(currentSessionId, { 
          ws, 
          sessionId: currentSessionId,
          dbSessionId: dbSessionId || undefined,
          sessionStartedAt: Date.now(),
          lastActive: new Date(),
          accessToken: data.token || undefined
        });
        
        // Generate personalized greeting if user is logged in
        let greeting = "Hello! I'm Lumos, your AI assistant. How can I help you today?";
        if (currentUserId) {
          try {
            // Get user profile for personalized greeting
            const profile = await supabaseAuthService.getUserProfile(currentUserId);
            if (profile?.name) {
              greeting = `Hello ${profile.name}! I'm Lumos, your AI assistant. How can I help you today?`;
            }
          } catch (error) {
            console.log('Could not fetch user profile for greeting:', error);
          }
        }
        
        ws.send(JSON.stringify({
          type: 'session_initialized',
          sessionId: currentSessionId,
          greeting
        }));
        
        console.log(`📝 Voice session initialized: ${currentSessionId}, userId: ${currentUserId}, dbSessionId: ${dbSessionId}`);
      }
        
      if (data.type === 'process_audio') {
        console.log('🎤 Processing audio...');
        
        // Ensure we have a session ID
        if (!currentSessionId) {
          currentSessionId = uuidv4();
          console.log(`🔄 Auto-creating voice session: ${currentSessionId}`);
          
          activeWebSocketSessions.set(currentSessionId, { 
            ws, 
            sessionId: currentSessionId, 
            lastActive: new Date() 
          });
        }
        
        // Add the audio data to STT buffer if provided
        if (data.audio) {
          const audioBuffer = Buffer.from(data.audio, 'base64');
          sttService.addChunk(audioBuffer);
          console.log(`📦 Added ${audioBuffer.length} bytes of audio data`);
        }
        
        const text = await sttService.processAudio();
        console.log(`🎤 Transcribed: "${text}"`);
        
        if (text.trim()) {
          // Send immediate acknowledgment
          ws.send(JSON.stringify({
            type: 'processing_start',
            message: 'Got it, thinking...'
          }));
          
          try {
            // Use streaming LLM for faster response
            console.log('🤖 Starting streaming response...');
            
            // Send streaming response
            ws.send(JSON.stringify({
              type: 'stream_start',
              message: 'Starting response...'
            }));
            
            let fullResponse = '';
            let sentenceBuffer = '';
            
            // Get the database session ID from the active session
            const activeSession = activeWebSocketSessions.get(currentSessionId);
            const dbSessionId = activeSession?.dbSessionId;
            
            // Stream the response token by token
            const userAccessToken = activeSession?.accessToken;
            for await (const token of llmService.streamResponse(text, currentUserId || undefined, undefined, dbSessionId, userAccessToken)) {
              fullResponse += token;
              sentenceBuffer += token;
              
              // Check if we have a complete sentence
              if (/[.!?]\s*$/.test(sentenceBuffer)) {
                // Send complete sentence for immediate TTS
                ws.send(JSON.stringify({
                  type: 'stream_chunk',
                  text: sentenceBuffer.trim(),
                  is_complete: false
                }));
                
                sentenceBuffer = '';
              }
            }
            
            // Send any remaining text
            if (sentenceBuffer.trim()) {
              ws.send(JSON.stringify({
                type: 'stream_chunk',
                text: sentenceBuffer.trim(),
                is_complete: false
              }));
            }
            
            // Send completion signal
            ws.send(JSON.stringify({
              type: 'stream_complete',
              full_text: fullResponse,
              emotional_state: llmService.analyzeEmotionalState()
            }));
            
            // Store session analytics if we have a database session
            if (dbSessionId && currentUserId) {
              try {
                const sessionDuration = Math.round((Date.now() - (activeSession?.sessionStartedAt || Date.now())) / 1000);
                await supabaseAuthService.storeSessionAnalytics(
                  dbSessionId,
                  currentUserId,
                  {
                    emotion: llmService.analyzeEmotionalState(),
                    tokens_used: fullResponse.length, // Approximate token count
                    duration_sec: sessionDuration,
                    metrics: {
                      model: 'gpt-4o-mini',
                      response_length: fullResponse.length,
                      user_message_length: text.length
                    }
                  }
                );
                console.log(`✅ Session analytics stored for session: ${dbSessionId}`);
              } catch (error) {
                console.error('❌ Failed to store session analytics:', error);
              }
            }
            
            console.log(`✅ Response completed for voice session: ${currentSessionId}, userId: ${currentUserId}, dbSessionId: ${dbSessionId}`);
            
          } catch (error) {
            console.error('❌ Streaming error:', error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Sorry, I encountered an error. Could you try again?'
            }));
          }
        } else {
          ws.send(JSON.stringify({
            type: 'no_speech_detected',
            message: 'I didn\'t hear anything. Could you try speaking again?'
          }));
        }
      }
        
      if (data.type === 'clear_conversation') {
        llmService.clearHistory();
        sttService.clearBuffer();
        // Clear conversation for specific user if provided
        if (data.userId) {
          console.log(`🧹 Clearing conversation for user: ${data.userId}`);
        }
        ws.send(JSON.stringify({ type: 'conversation_cleared' }));
      }
        
      if (data.type === 'get_analytics') {
        // For now, return empty analytics since we're not using database sessions
        ws.send(JSON.stringify({
          type: 'analytics',
          data: { messages: 0, duration: 0 }
        }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Sorry, I encountered an error. Please try again.'
      }));
    }
  });
  
  ws.on('close', async () => {
    console.log('🔌 WebSocket connection closed');
    sttService.clearBuffer();
    
    // Update database session end time if we have a database session
    if (currentSessionId && activeWebSocketSessions.has(currentSessionId)) {
      const session = activeWebSocketSessions.get(currentSessionId);
      if (session?.dbSessionId && session?.accessToken) {
        try {
          // TODO: Use authenticated client for session end update
          // For now, using the same client (RLS policies will handle security)
          await authSupabase
            .from('sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('id', session.dbSessionId);
          console.log(`✅ Database session ended: ${session.dbSessionId}`);
        } catch (error) {
          console.error('❌ Failed to update session end time:', error);
        }
      }
    }
    
    // Remove from active WebSocket sessions
    if (currentSessionId && currentSessionId.trim()) {
      activeWebSocketSessions.delete(currentSessionId);
      console.log(`📝 Voice session ended: ${currentSessionId}`);
    }
  });
});

// Cleanup old WebSocket sessions periodically
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [sessionId, session] of activeWebSocketSessions.entries()) {
    if (session.lastActive < oneHourAgo) {
      console.log(`🧹 Cleaning up old WebSocket session: ${sessionId}`);
      session.ws.close();
      activeWebSocketSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`🌟 Lumos Backend running on port ${PORT}`);
  console.log(`📊 Memory system: Enabled with Supabase Auth integration`);
  console.log(`🎯 Session management: Active (WebSocket only)`);
  console.log(`🔐 Auth system: Supabase Auth enabled`);
  
  // Test Supabase connection on startup
  try {
    const connectionTest = await supabaseAuthService.testConnection();
    if (connectionTest) {
      console.log(`✅ Database connection: SUCCESS`);
    } else {
      console.log(`❌ Database connection: FAILED`);
    }
  } catch (error) {
    console.log(`❌ Database connection test error:`, error);
  }
});
