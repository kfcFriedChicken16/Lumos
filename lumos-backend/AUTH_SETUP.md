# Lumos Authentication Setup Guide

This guide will help you set up the new user authentication and memory system for Lumos.

## 🚀 Quick Start

### 1. Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to the SQL Editor

2. **Run the New Schema**
   - Copy and paste the contents of `database-setup-new.sql`
   - Execute the SQL to create the new tables and functions

3. **Enable Authentication**
   - Go to Authentication > Settings
   - Enable "Email" provider
   - Configure email templates if desired

### 2. Environment Variables

Update your `.env` file with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Other existing variables...
```

### 3. Start the Backend

```bash
cd lumos-backend
npm run dev
```

### 4. Start the Frontend

```bash
cd lumos-frontend
npm run dev
```

## 🎯 How It Works

### User Flow

1. **Sign Up**: User creates account with email/password
2. **Profile Creation**: System automatically creates profile and preferences
3. **Sign In**: User logs in and gets personalized experience
4. **Jarvis Mode**: System loads user's context (profile, preferences, recent messages)
5. **Memory**: All conversations are stored and linked to the user

### Database Schema

- **`profiles`**: User identity (name, phone, age, MBTI, etc.)
- **`user_preferences`**: User preferences (voice, theme, etc.)
- **`sessions`**: Chat sessions with metadata
- **`messages`**: All conversation messages with user context
- **`session_analytics`**: Session-level analytics and insights

### API Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user and context
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/preferences` - Update preferences
- `GET /api/auth/jarvis-context` - Get full Jarvis context

## 🔧 Features

### ✅ What's New

- **User Authentication**: Email/password signup and login
- **Persistent Memory**: User conversations saved across sessions
- **Profile System**: Store user details (name, MBTI, etc.)
- **Preferences**: User-specific settings
- **Jarvis Context**: Load user's full context on login
- **Secure**: Row-level security and proper authentication

### 🔄 Migration from Old System

The new system is designed to work alongside your existing session-based system:

- **Backward Compatible**: Old session system still works
- **Gradual Migration**: Can migrate data over time
- **Dual Mode**: Supports both authenticated and anonymous users

## 🧪 Testing

### 1. Test Sign Up

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Sign In

```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Profile Update

```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your_token_here" \
  -d '{"name":"Jack","age":25,"mbti":"INTJ"}'
```

## 🎭 Jarvis Mode

When a user signs in, the system automatically:

1. **Loads Profile**: Gets user's name, MBTI, preferences
2. **Loads History**: Gets recent conversation messages
3. **Personalizes**: Uses context to provide personalized responses
4. **Remembers**: All new conversations are linked to the user

### Example Jarvis Context

```json
{
  "profile": {
    "name": "Jack",
    "age": 25,
    "mbti": "INTJ",
    "extras": {"school": "UNM", "interests": ["AI", "blockchain"]}
  },
  "preferences": {
    "voice": "warm",
    "theme": "dark",
    "language": "en"
  },
  "recentMessages": [
    {"role": "user", "content": "Hello Lumos!"},
    {"role": "assistant", "content": "Hello Jack! How can I help you today?"}
  ]
}
```

## 🔒 Security

- **Row-Level Security**: Users can only access their own data
- **HttpOnly Cookies**: Secure session management
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Proper error responses without data leakage

## 🚀 Next Steps

1. **Test the System**: Create accounts and test the full flow
2. **Customize Profiles**: Add more fields to the profile system
3. **Enhance Preferences**: Add more user preference options
4. **Migrate Data**: Move existing session data to user-based system
5. **Add Features**: Profile editing UI, preference management, etc.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Supabase URL and keys are correct
2. **CORS Issues**: Check that frontend and backend origins match
3. **Authentication Errors**: Verify Supabase Auth is enabled
4. **RLS Policies**: Ensure policies are created correctly

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 API Reference

See the individual service files for detailed API documentation:

- `src/services/supabase-auth.ts` - Authentication service
- `src/routes/auth.ts` - Auth endpoints
- `src/contexts/AuthContext.tsx` - Frontend auth context
