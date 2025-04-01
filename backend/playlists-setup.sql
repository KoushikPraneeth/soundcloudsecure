-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read only their own playlists
CREATE POLICY "Users can view their own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own playlists
CREATE POLICY "Users can create their own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update only their own playlists
CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a policy that allows users to delete only their own playlists
CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create playlist_tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (playlist_id, track_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read playlist tracks for playlists they own
CREATE POLICY "Users can view tracks in their playlists" ON playlist_tracks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM playlists WHERE id = playlist_tracks.playlist_id
    )
  );

-- Create a policy that allows users to insert tracks to their playlists
CREATE POLICY "Users can add tracks to their playlists" ON playlist_tracks
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM playlists WHERE id = playlist_tracks.playlist_id
    )
  );

-- Create a policy that allows users to delete tracks from their playlists
CREATE POLICY "Users can remove tracks from their playlists" ON playlist_tracks
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM playlists WHERE id = playlist_tracks.playlist_id
    )
  );

-- Create tracks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dropbox_id TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  album TEXT,
  year TEXT,
  genre TEXT,
  picture JSONB,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read only their own tracks
CREATE POLICY "Users can view their own tracks" ON tracks
  FOR SELECT USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own tracks
CREATE POLICY "Users can create their own tracks" ON tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update only their own tracks
CREATE POLICY "Users can update their own tracks" ON tracks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a policy that allows users to delete only their own tracks
CREATE POLICY "Users can delete their own tracks" ON tracks
  FOR DELETE USING (auth.uid() = user_id);
