# Frontend Setup Guide

## Environment Variables

Create a `.env.local` file in the `lumos-frontend` directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cmsfxeqyyihtdwrzgvwl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtc2Z4ZXF5eWlodGR3cnpndndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDQ0MDksImV4cCI6MjA3MTA4MDQwOX0.dpkjvDNuV37bLoeuY_Sm3gXjtdBKBRqdZ_krQwMZ8h0

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## What's Been Connected

✅ **Authentication System**
- Real Supabase authentication (no more mock data)
- Automatic session management
- Profile and preferences loading

✅ **Mood Tracking (Care Page)**
- Mood selections are saved to Supabase database
- Visual feedback when saving
- Data persists across sessions

✅ **Study Analytics (Study Page)**
- Timer sessions are tracked and saved
- Subject selection is required before starting
- Session duration and completion status recorded

✅ **Profile Management**
- Profile setup saves to database
- Profile data loads automatically on login

✅ **Voice Chat Integration**
- Uses real access tokens for authentication
- Connects to backend WebSocket with user context

## Database Tables Used

The frontend now connects to these Supabase tables:
- `profiles` - User profile information
- `preferences` - User preferences and settings
- `mood_entries` - Mood tracking data
- `study_sessions` - Study timer analytics
- `messages` - Chat history (read-only)

## PWA Features

Your PWA functionality remains intact:
- Offline caching via service worker
- App shortcuts for quick access
- Proper manifest configuration

## Next Steps

1. Create the `.env.local` file with the environment variables above
2. Make sure your backend is running on port 3001
3. Test the full flow: signup → profile setup → mood tracking → study timer → voice chat

All features now properly sync with your Supabase database!
