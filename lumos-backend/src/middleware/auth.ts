import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for token verification
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Get user from request token (ChatGPT's recommendation)
async function getUserFromRequest(req: Request): Promise<any> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('No user found in token');
    }

    console.log(`✅ Token verified for user: ${data.user.id}`);
    return data.user;
  } catch (error) {
    console.error('❌ Token verification error:', error);
    throw error;
  }
}

// Auth middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserFromRequest(req);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserFromRequest(req);
    req.user = user;
  } catch (error) {
    // Don't fail, just continue without user
    console.log('ℹ️ No valid token provided (optional auth)');
  }
  next();
};
