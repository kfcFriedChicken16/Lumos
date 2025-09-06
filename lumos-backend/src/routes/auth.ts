import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAuthService } from '../services/supabase-auth';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  age: z.number().min(1).max(120).optional(),
  mbti: z.string().optional(),
  extras: z.record(z.any()).optional()
});

const updatePreferencesSchema = z.object({
  prefs: z.record(z.any())
});

// Sign up endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = signUpSchema.parse(req.body);

    const { user, error } = await supabaseAuthService.signUp(email, password);

    if (error) {
      return res.status(400).json({ 
        error: error.message || 'Sign up failed',
        details: error 
      });
    }

    if (!user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    const { user, session, error } = await supabaseAuthService.signIn(email, password);

    if (error) {
      return res.status(401).json({ 
        error: error.message || 'Sign in failed',
        details: error 
      });
    }

    if (!user || !session) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // No need to set cookies - frontend will handle token storage

    res.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      session: {
        access_token: session.access_token,
        expires_in: session.expires_in
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out endpoint
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAuthService.signOut();

    if (error) {
      console.error('Sign out error:', error);
    }

    // No need to clear cookies - frontend handles token cleanup

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint (using token-based auth)
router.get('/me', authenticateUser, async (req: Request, res: Response) => {
  try {
    // User is already verified by middleware
    const user = req.user;

    // Get user's Jarvis context
    const jarvisContext = await supabaseAuthService.getJarvisContext(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: jarvisContext.profile,
      preferences: jarvisContext.preferences,
      recentMessages: jarvisContext.recentMessages
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile endpoint (using token-based auth)
router.put('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    // User is already verified by middleware
    const user = req.user;

    const profileData = updateProfileSchema.parse(req.body);

    await supabaseAuthService.updateUserProfile(user.id, profileData);

    res.json({ 
      message: 'Profile updated successfully',
      profile: profileData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update preferences endpoint (using token-based auth)
router.put('/preferences', authenticateUser, async (req: Request, res: Response) => {
  try {
    // User is already verified by middleware
    const user = req.user;

    const { prefs } = updatePreferencesSchema.parse(req.body);

    await supabaseAuthService.updateUserPreferences(user.id, prefs);

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: prefs
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Jarvis context endpoint (using token-based auth)
router.get('/jarvis-context', authenticateUser, async (req: Request, res: Response) => {
  try {
    // User is already verified by middleware
    const user = req.user;

    const jarvisContext = await supabaseAuthService.getJarvisContext(user.id);

    res.json({
      profile: jarvisContext.profile,
      preferences: jarvisContext.preferences,
      recentMessages: jarvisContext.recentMessages
    });
  } catch (error) {
    console.error('Get Jarvis context error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
