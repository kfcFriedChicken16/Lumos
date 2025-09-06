import express from 'express';
import { LLMService } from '../services/llm';

const router = express.Router();
const llmService = new LLMService();

// Generate AI response
router.post('/generate', async (req, res) => {
  try {
    const { message, userId, userPreferences } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await llmService.generateResponse(message, userId, userPreferences);
    
    res.json({ response });
  } catch (error) {
    console.error('LLM generation error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Stream AI response
router.post('/stream', async (req, res) => {
  try {
    const { message, userId, detectedLanguage, sessionId, userPreferences } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response with preferences
    for await (const chunk of llmService.streamResponse(message, userId, detectedLanguage, sessionId, undefined, userPreferences)) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('LLM streaming error:', error);
    res.status(500).json({ error: 'Failed to stream response' });
  }
});

export default router;
