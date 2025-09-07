# Real Data Setup Guide

## 🎯 Current Issue
The AI Learning Summary is showing mock/fallback content because the real services aren't configured.

## 🔧 Setup Steps

### 1. **Start the Backend Server**
```bash
cd lumos-backend
npm run dev
```
This should start the server on `http://localhost:3001`

### 2. **Configure Environment Variables**

Create or update your `.env.local` file in `lumos-frontend`:

```env
# Backend URL (for LLM service)
BACKEND_URL=http://localhost:3001

# YouTube API Key (Optional but recommended)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Backend Environment Variables (in lumos-backend/.env)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. **Get YouTube API Key (Optional)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add to `NEXT_PUBLIC_YOUTUBE_API_KEY`

### 4. **Get OpenRouter API Key (Required for LLM)**
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get an API key
3. Add to `lumos-backend/.env` as `OPENROUTER_API_KEY`

## 🚀 Test the Setup

### Test 1: Backend Connection
```bash
curl http://localhost:3001/api/llm/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","userId":"test"}'
```

### Test 2: Video Learning
1. Go to `/web/video-learning`
2. Paste a YouTube URL like: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Check if real video data loads
4. Check if AI summary generates

## 🔍 Troubleshooting

### If YouTube data is still mock:
- Check `NEXT_PUBLIC_YOUTUBE_API_KEY` is set
- Verify YouTube API is enabled in Google Cloud Console
- Check browser console for errors

### If AI summary is still mock:
- Ensure backend is running on port 3001
- Check `OPENROUTER_API_KEY` is set in backend
- Verify network connectivity between frontend and backend
- Check backend logs for errors

### If backend won't start:
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`
- Check backend logs for startup errors

## 📝 Expected Results

With proper setup, you should see:
- ✅ Real video titles and descriptions
- ✅ Actual video duration and channel info
- ✅ AI-generated learning summaries with:
  - Real key points based on video content
  - Specific learning objectives
  - Appropriate difficulty assessment
  - Relevant prerequisites
  - Meaningful summary text

## 🆘 Still Having Issues?

1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all environment variables are set
4. Test with a simple YouTube video first
5. Ensure both frontend and backend are running
