# Connecting Frontend to Backend

This guide explains how to connect the React frontend to the Spring Boot backend in the SoundVaultPro application.

## Overview

The integration between the frontend and backend works as follows:

1. Users authenticate through Supabase in the frontend
2. After successful authentication, the frontend registers the user with the backend
3. The backend uses Supabase to store and retrieve user data
4. The frontend communicates with the backend using the API service

## Frontend Integration

### API Service

The frontend uses the API service in `frontend/src/utils/api.ts` to communicate with the backend. This service provides methods for making HTTP requests to the backend API endpoints.

Key features:
- Automatically includes the Supabase authentication token in requests
- Provides type-safe methods for common API operations
- Handles error responses

### User Registration

When a user signs in with Supabase, the `SupabaseAuthCallback` component registers the user with the backend:

```typescript
// In SupabaseAuthCallback.tsx
try {
  await userApi.registerUser({
    supabaseId: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.full_name || session.user.email || 'User',
    profilePicture: session.user.user_metadata?.avatar_url
  });
} catch (error) {
  console.error('Error registering user with backend:', error);
  // Continue with login even if backend registration fails
}
```

### Example Usage

Check out the example component in `frontend/src/examples/BackendApiExample.tsx` for a demonstration of how to:
- Fetch user profile from the backend
- Save encryption keys to the backend
- Fetch and create playlists

## Backend Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `backend/supabase-setup.sql` in the Supabase SQL Editor to set up the necessary tables
3. Update the Supabase configuration in `backend/src/main/resources/application.properties` with your Supabase URL and API key:

```properties
supabase.url=YOUR_SUPABASE_URL
supabase.key=YOUR_SUPABASE_KEY
```

### Running the Backend

From the backend directory, run:

```bash
mvn spring-boot:run -Dsupabase.url=YOUR_SUPABASE_URL -Dsupabase.key=YOUR_SUPABASE_KEY
```

Or set environment variables:

```bash
export SUPABASE_URL=YOUR_SUPABASE_URL
export SUPABASE_KEY=YOUR_SUPABASE_KEY
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api/`

## Testing the Integration

1. Start the backend server
2. Start the frontend development server
3. Sign in with Supabase
4. Try using the example component to interact with the backend

## Troubleshooting

### CORS Issues

If you encounter CORS issues, check the CORS configuration in:
- `backend/src/main/resources/application.properties`
- `backend/src/main/java/com/soundvaultpro/api/config/SecurityConfig.java`

### Authentication Issues

If authentication fails:
1. Check that the Supabase token is being passed correctly in the Authorization header
2. Verify that the backend is correctly validating the token
3. Check the browser console and backend logs for error messages
