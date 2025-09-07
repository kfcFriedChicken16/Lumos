# Token-Based Authentication Setup

## Overview

This implementation follows ChatGPT's recommendation for proper token-based authentication between frontend and backend, replacing the previous session-based approach.

## How It Works

### 1. Frontend Authentication Flow
1. User signs in via `/api/auth/signin`
2. Backend returns `access_token` in response
3. Frontend stores token and sends it in `Authorization` header for subsequent requests
4. Frontend sends token in WebSocket `init_session` message

### 2. Backend Token Verification
1. Backend receives token in `Authorization: Bearer <token>` header
2. Middleware verifies token with Supabase using `supabase.auth.getUser(token)`
3. If valid, user is attached to `req.user`
4. If invalid, returns 401 Unauthorized

### 3. WebSocket Authentication
1. Frontend sends token in `init_session` message: `{ type: 'init_session', token: 'access_token' }`
2. Backend verifies token using `verifyWebSocketToken()`
3. If valid, user ID is extracted and used for conversation storage
4. If invalid, proceeds as anonymous user

## API Endpoints

### Protected Endpoints (Require Token)
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences
- `GET /api/auth/jarvis-context` - Get user's conversation context

### Public Endpoints (No Token Required)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

## Frontend Implementation

### HTTP Requests
```javascript
// After signin, store token
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { session } = await response.json();
localStorage.setItem('access_token', session.access_token);

// Use token for protected requests
const userResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

### WebSocket Connection
```javascript
// Send token with WebSocket init
ws.send(JSON.stringify({
  type: 'init_session',
  token: localStorage.getItem('access_token')
}));
```

## Benefits

1. **Better Security** - Backend verifies tokens instead of relying on session cookies
2. **Proper Architecture** - Frontend → Backend token passing
3. **Industry Standard** - Follows OAuth/JWT patterns
4. **Persistent Sessions** - Users stay logged in after page refresh
5. **Better UX** - No need to re-login on every page refresh

## Migration Notes

- Old session-based auth still works as fallback
- WebSocket connections work with or without tokens
- Backward compatible with existing frontend code
- No database changes required

## Testing

1. Sign in and verify token is returned
2. Test protected endpoints with token
3. Test WebSocket with token
4. Verify user stays logged in after page refresh
5. Test sign out clears token
