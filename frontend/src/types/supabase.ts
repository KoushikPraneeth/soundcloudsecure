export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  user_id: string;
  dropbox_id: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  year: string | null;
  genre: string | null;
  picture: any | null;
  encrypted_key: string;
  iv: string;
  created_at: string;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  added_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'created_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'created_at'>>;
      };
      tracks: {
        Row: Track;
        Insert: Omit<Track, 'id' | 'created_at'>;
        Update: Partial<Omit<Track, 'id' | 'created_at'>>;
      };
      playlist_tracks: {
        Row: PlaylistTrack;
        Insert: Omit<PlaylistTrack, 'added_at'>;
        Update: Partial<Omit<PlaylistTrack, 'added_at'>>;
      };
    };
  };
}
