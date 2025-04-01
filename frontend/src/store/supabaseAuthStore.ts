import { create } from 'zustand';
import { supabase, getSession, onAuthStateChange } from '../utils/supabase';
import { Session } from '@supabase/supabase-js';

interface SupabaseAuthState {
  user: any | null; //  use a more specific type later
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setUser: (user: any | null) => void; //  use a more specific type later
  clearAuth: () => void;
  startLoading: () => void;
  setError: (error: string | null) => void;
}

const useSupabaseAuthStore = create<SupabaseAuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  setSession: (session) => set({ session, isLoading: false, error: null }),
  setUser: (user) => set({ user, error: null }),
  clearAuth: () => set({ user: null, session: null, isLoading: false, error: null }),
  startLoading: () => set({ isLoading: true }),
  setError: (error) => set({ error, isLoading: false })
}));

// Initialize session and set up auth change listener
async function initializeAuth() {
  try {
    useSupabaseAuthStore.getState().startLoading();
    const initialSession = await getSession();
    
    if (initialSession) {
      useSupabaseAuthStore.setState({ 
        session: initialSession, 
        user: initialSession.user,
        isLoading: false,
        error: null 
      });
    } else {
      useSupabaseAuthStore.setState({ 
        session: null, 
        user: null,
        isLoading: false,
        error: null 
      });
    }

    onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        useSupabaseAuthStore.setState({ 
          user: session.user, 
          session: session, 
          isLoading: false,
          error: null 
        });
      } else if (event === 'SIGNED_OUT') {
        useSupabaseAuthStore.setState({ 
          user: null, 
          session: null, 
          isLoading: false,
          error: null 
        });
      } else if (event === 'USER_UPDATED' && session) {
        useSupabaseAuthStore.setState({ 
          user: session.user, 
          session: session,
          error: null 
        });
      }
    });
  } catch (error) {
    useSupabaseAuthStore.setState({ 
      isLoading: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
}
initializeAuth()
export default useSupabaseAuthStore;
