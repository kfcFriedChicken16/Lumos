# 🚀 Lumos Setup Guide

## Step 1: Get Your OpenAI API Key

1. **Go to OpenAI Platform:**
   - Visit: https://platform.openai.com/
   - Sign up or log in to your account

2. **Create API Key:**
   - Click on your profile (top right)
   - Go to "API Keys"
   - Click "Create new secret key"
   - Give it a name like "Lumos AI"
   - Copy the key (it starts with `sk-`)

3. **Add to .env file:**
   - Open `lumos-backend/.env`
   - Replace `your_openai_api_key_here` with your actual API key
   - Example: `OPENAI_API_KEY=sk-1234567890abcdef...`

## Step 2: Test Your Setup

1. **Start Backend:**
   ```bash
   cd lumos-backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd lumos-frontend
   npm run dev
   ```

3. **Test Voice:**
   - Go to http://localhost:3000
   - Click the mic button
   - Speak something
   - Lumos should respond!

## What Happens Now?

- **Without API Key:** Uses smart mock responses (still impressive!)
- **With API Key:** Full AI conversation with real GPT-4 responses

## Troubleshooting

- **"API key missing" error:** Make sure your `.env` file has the correct API key
- **"Invalid API key" error:** Check that you copied the full key correctly
- **Backend won't start:** Make sure you're in the `lumos-backend` directory

## Cost Note

- OpenAI charges per API call (very cheap for testing)
- Mock mode is completely free
- Perfect for hackathon demos!

## Ready to Demo! 🎉

Your Lumos is now ready to impress at your hackathon!
