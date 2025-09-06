# Lumos Backend

An empathetic AI companion for Malaysian university students.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Get OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Go to API Keys section
   - Create a new API key
   - Copy the key and paste it in your `.env` file

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Features

- **Speech-to-Text (STT):** Converts voice to text using OpenAI Whisper
- **Natural Language Processing:** Empathetic AI responses using GPT-4
- **Text-to-Speech (TTS):** Converts AI responses back to voice
- **WebSocket Communication:** Real-time voice interaction
- **Webhook Support:** For proactive notifications and scheduling

## API Endpoints

- `GET /health` - Server health check
- `POST /webhooks/n8n` - Webhook for external notifications
- `POST /webhooks/test` - Test webhook endpoint
- `WebSocket /` - Real-time voice communication

## Current Status

The backend is set up with mock AI services for testing. To enable full functionality:

1. Add your OpenAI API key to `.env`
2. The mock services will automatically switch to real AI processing
3. Voice recording, transcription, and AI responses will work end-to-end

## Architecture

```
Frontend (3000) → WebSocket → Backend (3001) → OpenAI APIs
                                    ↓
                              STT → LLM → TTS
```

## Development

- **TypeScript** for type safety
- **Express.js** for API server
- **WebSocket** for real-time communication
- **OpenAI API** for AI capabilities
- **Nodemon** for development auto-reload
