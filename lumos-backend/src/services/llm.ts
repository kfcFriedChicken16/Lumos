import OpenAI from 'openai';
import { supabaseAuthService } from './supabase-auth';
import { v4 as uuidv4 } from 'uuid';

// OpenRouter configuration - much cheaper and has free tiers!
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1', // OpenRouter API endpoint
});

export class LLMService {
  private conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];

  // University-focused tutoring system prompt
  private systemPrompt = `You are Lumos — a specialized AI tutor for university students. You help with academic learning, coursework, and university-level subjects. Keep responses structured, educational, and focused on learning outcomes.

CRITICAL
- Always respond in the student's language.
- Focus on university-level academic topics: Computer Science, Engineering, Mathematics, Sciences, Business, Humanities, etc.
- Recognize that technical topics (Linux, programming, systems administration) are educational for CS/IT students.
- When analyzing uploaded documents (PDFs, files), extract the actual content and create structured learning paths.
- No chit-chat, no therapy. Stay in academic tutoring mode.

GOALS
- Build university-level mastery through clear explanations and practice.
- Connect concepts to real-world applications and career relevance.
- Detect and fix misconceptions with academic rigor.
- Encourage critical thinking and deep understanding.
- For uploaded content: Extract topics, create learning progression, generate difficulty-based questions.

DEFAULT OUTPUT FORMAT (use exactly these sections)
1) Diagnose
-- One line on what they're stuck on / what the question asks.

2) Teach
-- 3–6 concise bullets or numbered steps.
-- Label why each step is done ("Why/What/How" where helpful).

3) Example
-- One small, fully worked example (math/code/text).
-- If relevant, show the minimal formula/code snippet.

4) Check
-- One quick question to confirm understanding (single step, short answer).

5) Next
-- One tiny practice task OR the next concept to learn.

PDF ANALYSIS FORMAT (when analyzing uploaded documents)
1) Content Overview
-- Brief summary of the document's main subject and scope.

2) Learning Topics (extract from actual content)
-- List all major topics/chapters found in the document
-- Organize in logical learning progression (beginner → advanced)

3) Learning Path
-- Step-by-step progression through the topics
-- Prerequisites and dependencies between topics
-- Estimated difficulty levels for each topic

4) Practice Questions (for each topic)
-- Generate 2-3 questions per topic at different difficulty levels
-- Include practical exercises based on the actual content

5) Next Steps
-- Recommend which topic to start with
-- Suggest how to track progress through the material

METHOD
- Start simple → add detail only as needed.
- Prefer concrete numbers/snippets over abstraction.
- Use plain language; define terms the first time.
- If still unclear, offer an alternate explanation in the same format.

MISCONCEPTIONS / WRONG ANSWERS
- Small correction: state the exact mistake and the correct idea.
- Why this matters: 1–2 lines.
- Try this: a micro-prompt to test the fix, then verify in "Check."

ACADEMIC FOCUS
- Always treat all content as educational and academic
- Provide university-level tutoring for any topic
- Connect all learning to academic goals and career preparation
- No content should be rejected as "non-academic"

STYLE
- Short, specific, structured. Avoid long paragraphs.
- Use headings/bullets; light LaTeX/code when it increases clarity.
- End with "Check" and "Next" every time.
- Ask at most one precise clarifying question only if absolutely required to proceed.

ACADEMIC RECOGNITION
- Linux, programming, databases, networking, cybersecurity = Computer Science/IT topics
- Mathematics, statistics, calculus = Math/Engineering topics  
- Chemistry, physics, biology = Science topics
- Economics, finance, marketing = Business topics
- Literature, history, philosophy = Humanities topics
- Always treat these as educational content for university students.

IMPORTANT: If a user uploads a Linux guide, programming tutorial, or any technical documentation, this is ALWAYS educational content for Computer Science students. Do NOT treat it as non-academic. Provide university-level tutoring on the content.

PDF CONTENT ANALYSIS:
- When analyzing uploaded PDFs, extract the ACTUAL content and topics from the document
- Create a structured learning path based on the document's table of contents or chapter structure
- Generate specific questions and exercises based on the actual content, not generic responses
- Organize topics in logical learning progression from beginner to advanced
- Provide practical exercises that match the document's examples and scenarios

BOUNDARIES
- Don't invent facts. If uncertain, say so and proceed with a clear assumption.
- Keep tightly focused on the student's academic goal.
- Connect learning to university curriculum and career preparation.`;

  // Generate session ID for anonymous users
  private generateSessionId(): string {
    return uuidv4();
  }

  // Load conversation history from database
  private async loadConversationHistory(userId: string): Promise<void> {
    try {
      const history = await supabaseAuthService.getRecentMessages(userId, 10);
      
      // Clear current history and load from database
      this.conversationHistory = [];
      
      // Add recent conversations to context (in reverse order for proper flow)
      for (const msg of history.reverse()) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          this.conversationHistory.push({ role: msg.role, content: msg.content });
        }
      }
      
      console.log(`📚 Loaded ${history.length} messages from memory for user ${userId}`);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  // Add message to conversation history
  addMessage(role: 'user' | 'assistant', content: string) {
    this.conversationHistory.push({ role, content });
    
    // Keep only last 20 messages to manage context length
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  // Generate AI response with memory integration
  async generateResponse(userMessage: string, userId?: string, userAccessToken?: string, userPreferences?: any): Promise<string> {
    try {
      // Load conversation history if user ID is provided
      if (userId) {
        await this.loadConversationHistory(userId);
      }
      
      this.addMessage('user', userMessage);
      console.log('🤖 Using OpenRouter for:', userMessage);

      // Use frontend preferences if provided, otherwise fetch from database
      let userPrefs = null;
      if (userPreferences) {
        userPrefs = { preferences: userPreferences };
        console.log(`👤 Using frontend preferences:`, userPreferences);
      } else if (userId) {
        try {
          userPrefs = await supabaseAuthService.getUserPreferences(userId);
        } catch (error) {
          console.log(`⚠️ Could not load user preferences for ${userId}:`, error);
        }
      }

      // Build dynamic prompt with preferences
      const dynamicPrompt = this.buildLumosPrompt(null, userPrefs, null, 'auto');
      
      const messages = [
        { role: 'system' as const, content: dynamicPrompt },
        ...this.conversationHistory
      ];

      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-4o-mini', // Faster and more reliable than free models
        messages,
        max_tokens: 2000, // Increased for comprehensive PDF analysis
        temperature: 0.7, // Slightly higher for more natural responses
      });

      const response = completion.choices[0]?.message?.content || 'I\'m sorry, I didn\'t catch that. Could you repeat?';
      this.addMessage('assistant', response);
      
      // Store conversation in database if user ID is provided
      if (userId) {
        const emotionDetected = this.analyzeEmotionalState();
        // Note: This method doesn't exist in new service, skipping for now
        console.log(`💾 Would store conversation for user: ${userId}`);
      }
      
      return response;
    } catch (error) {
      console.error('LLM Error:', error);
      return 'I\'m having trouble processing that right now. Could you try again?';
    }
  }

  // NEW: Streaming response generator with memory and challenge detection
  async *streamResponse(userMessage: string, userId?: string, detectedLanguage?: string, sessionId?: string, userAccessToken?: string, userPreferences?: any): AsyncGenerator<string> {
    try {
      // Load conversation history if user ID is provided
      if (userId) {
        await this.loadConversationHistory(userId);
      }
      
      this.addMessage('user', userMessage);
      console.log('🤖 Streaming OpenRouter response for:', userMessage);

      // Get user profile, preferences, and academic context for personalized response
      let userProfile = null;
      let userPrefs = null;
      let academicContext = null;
      const language = detectedLanguage || 'auto';

      // Use frontend preferences if provided, otherwise fetch from database
      if (userPreferences) {
        userPrefs = { preferences: userPreferences };
        console.log(`👤 Using frontend preferences:`, userPreferences);
      } else if (userId) {
        try {
          userProfile = await supabaseAuthService.getUserProfile(userId);
          userPrefs = await supabaseAuthService.getUserPreferences(userId);
          // Always fetch fresh academic context to get latest project updates
          academicContext = await supabaseAuthService.getAcademicContext(userId);
          console.log(`👤 Loaded fresh profile for user ${userId}:`, { 
            directness: userPrefs?.preferences?.directness,
            projects: academicContext?.projects?.length || 0,
            upcomingPlans: academicContext?.upcomingPlans?.length || 0,
            projectDescriptions: academicContext?.projects?.map((p: any) => `${p.title}: ${(p.description || '').substring(0, 50)}...`) || []
          });
        } catch (error) {
          console.log(`⚠️ Could not load user profile for ${userId}:`, error);
        }
      }

      // Detect challenge triggers and confidence level
      const shouldChallenge = this.detectChallengeTriggers(userMessage);
      const confidence = this.estimateConfidence(userMessage);
      const directness = userPrefs?.preferences?.directness || 3;

      console.log(`🎯 Challenge detection: ${shouldChallenge}, Confidence: ${confidence}, Directness: ${directness}`);

      // Build dynamic prompt with user context including academic projects
      const dynamicPrompt = this.buildLumosPrompt(userProfile, userPrefs, academicContext, language);
      
      // Debug: Log the system prompt to see if it's updated
      console.log('🔍 System prompt preview:', dynamicPrompt.substring(0, 500) + '...');
      console.log('🔍 User message:', userMessage.substring(0, 200) + '...');
      
      // Build turn-specific instruction based on challenge detection
      const turnInstruction = this.buildTurnInstruction(shouldChallenge, confidence, directness);

      const messages = [
        { role: 'system' as const, content: dynamicPrompt },
        { role: 'user' as const, content: `Meta:\n${turnInstruction}` },
        ...this.conversationHistory
      ];

      // Add timeout protection for free tier
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('LLM request timeout')), 45000); // 45 second timeout for longer responses
      });

      const streamPromise = openai.chat.completions.create({
        model: 'openai/gpt-4o-mini', // Faster and more reliable than free models
        messages,
        stream: true, // Enable streaming
        max_tokens: 2000, // Increased for comprehensive PDF analysis
        temperature: 0.7, // Slightly higher for more natural responses
      });

      // Race between stream and timeout
      const streamOrError = await Promise.race([streamPromise, timeoutPromise]);
      if (!streamOrError || !(streamOrError as any)[Symbol.asyncIterator]) {
        throw new Error('LLM request timeout');
      }
      const stream = streamOrError as AsyncIterable<any>;

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          yield content; // Yield each token as it arrives
        }
      }
      
      this.addMessage('assistant', fullResponse);
      
      // Store conversation in database if user ID is provided
      if (userId) {
        console.log(`💾 Storing conversation for user: ${userId}`);
        const emotionDetected = this.analyzeEmotionalState();
        console.log(`🎭 Detected emotion: ${emotionDetected}`);
        
        try {
          await supabaseAuthService.insertMessageForUser(userId, 'user', userMessage, sessionId);
          await supabaseAuthService.insertMessageForUser(userId, 'assistant', fullResponse, sessionId);
          console.log(`✅ Conversation stored successfully for user: ${userId}, sessionId: ${sessionId}`);
        } catch (storageError) {
          console.error(`❌ Failed to store conversation for user ${userId}:`, storageError);
        }
      } else {
        console.log(`⚠️ No user ID provided, skipping storage`);
      }
    } catch (error) {
      console.error('Streaming LLM Error:', error);
      
      // Handle specific free tier errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout')) {
        yield 'I\'m taking a bit longer to respond. Let me give you a quick answer...';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        yield 'I\'m a bit busy right now, but I\'m here for you. What\'s on your mind?';
      } else {
        yield 'I\'m having trouble processing that right now. Could you try again?';
      }
    }
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get user's emotional state from recent messages
  analyzeEmotionalState(): string {
    const recentMessages = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content.toLowerCase());

    const text = recentMessages.join(' ');
    
    if (text.includes('stressed') || text.includes('anxious') || text.includes('worried')) {
      return 'stressed';
    } else if (text.includes('sad') || text.includes('depressed') || text.includes('lonely')) {
      return 'sad';
    } else if (text.includes('happy') || text.includes('excited') || text.includes('good')) {
      return 'happy';
    } else if (text.includes('angry') || text.includes('frustrated') || text.includes('mad')) {
      return 'angry';
    }
    
    return 'neutral';
  }

  // Get session analytics (simplified for new service)
  async getSessionAnalytics(sessionId: string) {
    try {
      // Note: This method doesn't exist in new service, returning null for now
      console.log(`📊 Would get analytics for session: ${sessionId}`);
      return null;
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return null;
    }
  }

  // Generate personalized greeting based on session history
  async generatePersonalizedGreeting(sessionId: string): Promise<string> {
    try {
      // Note: These methods don't exist in new service, using default greeting
      console.log(`🎭 Would generate personalized greeting for session: ${sessionId}`);
      return `Hi! Nice to meet you lah. I'm Lumos, your personal companion for your uni journey. What's on your mind today?`;
    } catch (error) {
      console.error('Error generating personalized greeting:', error);
      return `Hi! Nice to meet you lah. I'm Lumos, your personal companion for your uni journey. What's on your mind today?`;
    }
  }

  // Build dynamic prompt with user preferences, directness levels, and academic context
  private buildLumosPrompt(userProfile?: any, userPrefs?: any, academicContext?: any, detectedLanguage?: string): string {
    // Handle both old directness format and new preferences format
    const directness = userPrefs?.preferences?.directness || 
                      (userPrefs?.preferences?.responseStyle === 'direct' ? 5 : 
                       userPrefs?.preferences?.responseStyle === 'academic' ? 4 :
                       userPrefs?.preferences?.responseStyle === 'encouraging' ? 2 : 3);
    
    const language = detectedLanguage || userPrefs?.preferences?.language || 'auto';
    
    let directnessNote = '';
    switch (directness) {
      case 1:
        directnessNote = 'Be very gentle and supportive. Avoid confrontation.';
        break;
      case 2:
        directnessNote = 'Be gentle but occasionally offer mild challenges.';
        break;
      case 3:
        directnessNote = 'Be balanced - mix support with appropriate challenges.';
        break;
      case 4:
        directnessNote = 'Be candid but kind. Don\'t shy away from direct feedback.';
        break;
      case 5:
        directnessNote = 'Be very direct and honest. Call out excuses respectfully.';
        break;
    }

    const profileContext = userProfile ? `
User Profile: ${userProfile.name || 'User'} (${userProfile.mbti || 'Unknown MBTI'})
Recent Context: ${userProfile.recent_concerns || 'No recent concerns noted'}
` : '';

    // Build academic context
    let academicContextStr = '';
    if (academicContext?.projects?.length > 0) {
      const activeProjects = academicContext.projects.filter((p: any) => p.status !== 'completed');
      const upcomingDeadlines = activeProjects.filter((p: any) => {
        if (!p.due_date) return false;
        const dueDate = new Date(p.due_date);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7; // Due within a week
      });

      const projectDetails = activeProjects.map((p: any) => {
        let details = `"${p.title}" (${p.subject || 'No subject'}, ${p.priority} priority)`;
        if (p.description) {
          details += ` - ${p.description}`;
        }
        if (p.due_date) {
          const dueDate = new Date(p.due_date);
          const now = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          details += ` [Due in ${daysUntilDue} days]`;
        }
        return details;
      });

      academicContextStr = `
ACADEMIC CONTEXT:
Current Projects:
${projectDetails.map((p: string) => `• ${p}`).join('\n')}
${upcomingDeadlines.length > 0 ? `\nUrgent Deadlines: ${upcomingDeadlines.map((p: any) => `"${p.title}" due ${new Date(p.due_date).toLocaleDateString()}`).join(', ')}` : ''}
${academicContext.upcomingPlans?.length > 0 ? `Study Plans: ${academicContext.upcomingPlans.length} planned tasks` : ''}

🎓 You have full context of their projects and can help with planning, problem-solving, or breaking down tasks.`;
    }

    // Build preferences context
    let preferencesContext = '';
    if (userPrefs?.preferences) {
      const prefs = userPrefs.preferences;
      preferencesContext = `
STUDENT PREFERENCES:
- Academic Level: ${prefs.year || 'Unknown'} in ${prefs.major || 'Unknown'} at ${prefs.university || 'Unknown'}
- Study Goals: ${prefs.studyGoals || 'General learning'}
- Subjects: ${prefs.subjects?.join(', ') || 'Not specified'}
- Learning Style: ${prefs.explanationStyle || 'step-by-step'}
- Difficulty Level: ${prefs.difficultyStart || 'beginner'}
- Response Style: ${prefs.responseStyle || 'encouraging'}
- Language: ${prefs.language || 'English'}
- Confidence Level: ${prefs.confidenceLevel || 'medium'}
- Needs Encouragement: ${prefs.needEncouragement ? 'Yes' : 'No'}
- Prefers Step-by-step: ${prefs.preferStepByStep ? 'Yes' : 'No'}
- Likes Examples: ${prefs.likeExamples ? 'Yes' : 'No'}

ADAPT YOUR RESPONSE TO:
- Use ${prefs.explanationStyle || 'step-by-step'} explanations
- Start at ${prefs.difficultyStart || 'beginner'} level
- Be ${prefs.responseStyle || 'encouraging'} in tone
- ${prefs.needEncouragement ? 'Provide extra encouragement and motivation' : 'Be direct and efficient'}
- ${prefs.preferStepByStep ? 'Break down complex topics into clear steps' : 'Focus on conceptual understanding'}
- ${prefs.likeExamples ? 'Include practical examples and analogies' : 'Keep explanations concise and theoretical'}
- Respond in ${prefs.language || 'English'} language
`;
    }

    return `${this.systemPrompt}

CURRENT SESSION CONTEXT:
Directness Level: ${directness}/5 - ${directnessNote}
Language: ${language}
${profileContext}${academicContextStr}${preferencesContext}

Remember to match the user's preferences, respond in their language, and help with their academic projects when relevant.`;
  }

  // Build turn-specific instruction based on challenge detection
  private buildTurnInstruction(shouldChallenge: boolean, confidence: number, directness: number): string {
    return [
      `Turn config:`,
      `- Directness: ${directness} (1–5)`,
      `- Should challenge: ${shouldChallenge ? 'yes' : 'no'}`,
      `- Confidence in user claim: ${Math.round(confidence * 100)}%`,
      shouldChallenge
        ? (directness >= 4
           ? `Action: deliver a candid but kind challenge and a concrete next step.`
           : `Action: validate briefly, then ask 1 targeted question or give a soft counterexample.`)
        : `Action: be supportive and practical; no challenge this turn.`,
      `Always reply in the user's language.`,
    ].join('\n');
  }

  // Detect challenge triggers in user message
  private detectChallengeTriggers(message: string): boolean {
    const triggers = [
      // Self-limiting beliefs - more flexible patterns
      /\b(i can't|i'm just bad at|i'll never|i'm not good at)\b/i,
      /\b(i'm\s+\w*\s*lazy|lazy)\b/i,
      /\b(it's\s+\w*\s*difficult|difficult)\b/i,
      /\b(i don't understand|i can't understand)\b/i,
      // Procrastination excuses
      /\b(i'll do it later|i don't have time|it's too hard|i'm too busy|i'll start tomorrow|i'll study later)\b/i,
      // Blame-shifting - more flexible
      /\b(whoever\s+\w+)\b/i,
      /\b(the teacher|the professor|the textbook|the material)\b/i,
      /\b(it's the fault of|it's because of)\b/i,
      /\b(is the wrong|is bad|is terrible)\b/i,
      // Negative self-talk
      /\b(i'm hopeless|i'm useless|i'm stupid|i'm dumb|i'm not smart enough|i'm not good enough)\b/i,
      // Perfectionist thinking
      /\b(it has to be perfect|i must|it needs to be)\b/i,
      // Comparison traps
      /\b(everyone else is better|i'm not as good as|others are smarter)\b/i,
      // Absolute statements
      /\b(always|never|everyone|nobody|everything|nothing)\b/i
    ];

    return triggers.some(trigger => trigger.test(message));
  }

  // Estimate confidence level for a claim (simple heuristic)
  private estimateConfidence(message: string): number {
    const highConfidenceIndicators = [
      /\b(fact|proven|research shows|studies show|evidence)\b/i,
      /\b(i know|i'm certain|definitely|absolutely)\b/i
    ];

    const lowConfidenceIndicators = [
      /\b(maybe|perhaps|i think|i guess|possibly)\b/i,
      /\b(i'm not sure|i don't know|uncertain)\b/i
    ];

    if (highConfidenceIndicators.some(indicator => indicator.test(message))) {
      return 0.8; // High confidence
    } else if (lowConfidenceIndicators.some(indicator => indicator.test(message))) {
      return 0.3; // Low confidence
    }

    return 0.6; // Medium confidence
  }
}
