import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

// Keep existing Dropbox types
export interface AuthSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      username?: string;
    };
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthError {
  message: string;
  status?: number;
}

// Add Supabase user type
export type SupabaseUserType = SupabaseUser;
