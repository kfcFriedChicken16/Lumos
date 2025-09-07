# 🚀 OpenRouter Setup Guide

## Why OpenRouter?

✅ **Much Cheaper** - Often 10x cheaper than OpenAI  
✅ **Free Tiers** - Many models have free usage  
✅ **Multiple Models** - Access to DeepSeek, Anthropic, Google, etc.  
✅ **Same API** - Uses OpenAI-compatible API  

## Step 1: Get OpenRouter API Key

1. **Go to OpenRouter:** https://openrouter.ai/
2. **Sign up** for a free account
3. **Go to API Keys** section
4. **Create new API key**
5. **Copy the key** (starts with `sk-or-`)

## Step 2: Update Your Code

Replace `your_openrouter_api_key_here` in these files:
- `src/services/llm.ts`
- `src/services/stt.ts` 
- `src/services/tts.ts`

Example:
```typescript
const openai = new OpenAI({
  apiKey: 'sk-or-your-actual-key-here',
  baseURL: 'https://openrouter.ai/api/v1',
});
```

## Step 3: Available Free Models

**For Chat (LLM):**
- `deepseek-ai/deepseek-r1-0528-qwen3-8b-free` - **RECOMMENDED** (Best for conversation)
- `deepseek-ai/deepseek-v3-0324-free` - Alternative (Latest V3)
- `meta-llama/llama-3.1-8b-instruct` - Free tier
- `microsoft/phi-3.5-mini-4k-instruct` - Free tier

**For STT (Speech-to-Text):**
- OpenRouter doesn't have STT yet, using mock for now

**For TTS (Text-to-Speech):**
- OpenRouter doesn't have TTS yet, using mock for now

## Step 4: Test Your Setup

1. **Start Backend:** `npm run dev`
2. **Test Chat:** Your LLM will now use real AI!
3. **Voice:** STT/TTS still use mock (but LLM is real)

## Cost Comparison

| Service | OpenAI | OpenRouter |
|---------|--------|------------|
| GPT-4o-mini | $0.15/1M tokens | $0.0002/1M tokens |
| DeepSeek | N/A | FREE tier |
| Llama 3.1 | N/A | FREE tier |

## Benefits for Your Hackathon

✅ **Real AI responses** - No more mock responses  
✅ **Very cheap** - Won't break the bank  
✅ **Multiple models** - Can switch between different AIs  
✅ **Professional demo** - Real AI conversation  

## Ready to Demo! 🎉

Your Lumos will now have real AI conversation capabilities!
