import { createClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signInWithOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/supabase/callback`,
    },
  });

  if (error) {
    console.error('Error signing in with OAuth:', error);
    throw error;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }
  return data.session;
}

export async function handleSupabaseCallback() {
  try {
    // Parse the URL to get the code and refresh token
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error('No tokens found in URL');
    }

    // Set the session with the tokens
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error in handleSupabaseCallback:', error);
    throw error;
  }
}

export async function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const {
    data: { subscription },
  } = await supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// Playlist Management Functions
export async function createPlaylist(name: string, description?: string) {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: session.user.id,
      name,
      description
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }

  return data;
}

export async function fetchPlaylists() {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }

  return data;
}

export async function deletePlaylist(id: string) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
}

export async function updatePlaylist(id: string, updates: { name?: string; description?: string }) {
  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }

  return data;
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const { error } = await supabase
    .from('playlist_tracks')
    .insert({
      playlist_id: playlistId,
      track_id: trackId
    });

  if (error) {
    console.error('Error adding track to playlist:', error);
    throw error;
  }
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .match({
      playlist_id: playlistId,
      track_id: trackId
    });

  if (error) {
    console.error('Error removing track from playlist:', error);
    throw error;
  }
}

export async function fetchPlaylistTracks(playlistId: string) {
  const { data, error } = await supabase
    .from('playlist_tracks')
    .select(`
      track_id,
      tracks (*)
    `)
    .eq('playlist_id', playlistId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }

  return data;
}
