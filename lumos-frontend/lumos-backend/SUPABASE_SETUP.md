# Supabase Setup Guide for Lumos

## 🚀 Quick Setup

### 1. Database Setup
1. Go to your Supabase project: https://cmsfxeqyyihtdwrzgvwl.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-setup.sql`
4. Click **Run** to create all tables and functions

### 2. Environment Variables
The `.env` file should already be configured with your Supabase credentials:
```
SUPABASE_URL=https://cmsfxeqyyihtdwrzgvwl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Test the Integration
1. Start the backend: `npm run dev`
2. Check the console for: `📊 Memory system: Enabled with Supabase integration`
3. Test voice interaction - conversations will now be stored!

## 📊 Database Schema (Improved)

### Tables Created:
- **sessions** - Track user sessions and activity
- **conversations** - Store all messages and responses
- **user_preferences** - User settings and preferences
- **session_analytics** - Automated analytics and insights

### Key Improvements:
- ✅ **NOT NULL constraints** - Required fields properly enforced
- ✅ **Unique constraints** - Prevents duplicate analytics entries
- ✅ **Proper RLS policies** - WITH CHECK clauses for INSERT operations
- ✅ **Cleaner JSON aggregation** - Better emotion breakdown calculation
- ✅ **Removed overly permissive grants** - Security-focused approach
- ✅ **Better trigger management** - DROP IF EXISTS prevents conflicts

### Security Features:
- 🔒 **Row Level Security (RLS)** - Enabled on all tables
- 🔒 **Demo policies** - Open for hackathon, can be tightened later
- 🔒 **Proper constraints** - Data integrity enforced
- 🔒 **No overly permissive grants** - Supabase handles access control

## 🎯 Memory Features

### What Lumos Remembers:
- **Conversation history** - Past messages and responses
- **User preferences** - Language, topics, voice settings
- **Emotional patterns** - Mood trends and stress levels
- **Session analytics** - Usage patterns and insights

### Personalized Responses:
- **"Welcome back!"** - Recognizes returning users
- **"I remember you were stressed about exams"** - References past concerns
- **"You've been in a positive mood lately!"** - Acknowledges emotional patterns
- **Contextual advice** - Builds on previous conversations

## 🔧 API Endpoints

### Session Management:
- `POST /api/session/create` - Create new session
- `GET /api/session/:sessionId/analytics` - Get session insights

### WebSocket Messages:
- `init_session` - Initialize session with memory
- `get_analytics` - Request session analytics
- `process_audio` - Process voice with memory context

## 🎪 Demo Features

### For Hackathon:
1. **Show memory in action** - Have multiple conversations
2. **Demonstrate personalization** - "Welcome back" greetings
3. **Display analytics** - Show conversation insights
4. **Highlight persistence** - Restart app, memory remains

### Sample Conversation Flow:
```
User: "Hi Lumos, I'm Jack"
Lumos: "Hi Jack! Nice to meet you lah. I'm Lumos, your personal companion for your uni journey. What's on your mind today?"

User: "I'm stressed about my final exams"
Lumos: "Yeah, I totally get that feeling overwhelmed thing - especially during exam season. What subject is giving you the most trouble?"

[Later...]
User: "Hi again"
Lumos: "Welcome back! I remember you've been feeling a bit stressed lately. How are you doing today?"
```

## 🛠 Troubleshooting

### Common Issues:
1. **Database connection failed** - Check Supabase URL and API key
2. **Tables not found** - Run the SQL setup script
3. **Memory not working** - Check session initialization
4. **Analytics empty** - Wait for conversations to accumulate

### Debug Commands:
```bash
# Check database connection
curl http://localhost:3001/health

# Test session creation
curl -X POST http://localhost:3001/api/session/create

# View database tables
# Go to Supabase Dashboard > Table Editor
```

## 🔒 Security Notes

### Current Setup (Demo):
- **Open policies** - Allow all operations for hackathon demo
- **Anonymous access** - No authentication required
- **Session-based** - Track by session ID only

### Post-Hackathon Security:
- **Tighten RLS policies** - Restrict access by session ID
- **Add authentication** - User accounts and login
- **Data privacy** - Implement data retention policies
- **Audit logging** - Track access and changes

## 🚀 Next Steps

### Phase 2 Features (Post-Hackathon):
- **User accounts** - Email/password authentication
- **Advanced analytics** - Detailed insights dashboard
- **Export data** - Download conversation history
- **Privacy controls** - User data management

### MCP Integration:
- **Calendar sync** - Schedule study sessions
- **Task management** - Track assignments and deadlines
- **External APIs** - Weather, news, productivity tools
- **Advanced automation** - Smart reminders and notifications

## 📈 Performance Notes

- **Session cleanup** runs daily, removes sessions older than 7 days
- **Memory limit** - Last 20 messages kept in context
- **Analytics** - Real-time updates with each conversation
- **Scalability** - Designed for multiple concurrent users
- **Indexes** - Optimized for common query patterns

## 🎯 Technical Improvements

### Database Reliability:
- **Proper constraints** - Data integrity guaranteed
- **Efficient triggers** - Real-time analytics updates
- **Clean JSON handling** - Better emotion aggregation
- **Conflict resolution** - Proper upsert operations

### Security Best Practices:
- **RLS enabled** - Row-level access control
- **No overly permissive grants** - Principle of least privilege
- **Proper foreign keys** - Referential integrity
- **Demo policies** - Easy to tighten later

---

**🎉 Congratulations!** Your Lumos now has a robust, secure, and scalable memory system that can provide personalized experiences for Malaysian students!
