import { create } from 'zustand';
import { Track, PlayerState } from '../types';
import type { AudioMetadata } from '../utils/metadata';

interface PlayerStore extends PlayerState {
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (playlist: Track[]) => void;
  appendToPlaylist: (tracks: Track[]) => void;
  setIsLoadingMore: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  setMetadata: (trackId: string, metadata: AudioMetadata) => void;
  setIsLoadingMetadata: (isLoading: boolean) => void;
  setMetadataError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  playlist: [],
  isLoadingMore: false,
  hasMore: true,
  cursor: null,
  currentTime: 0,
  duration: 0,
  isLoadingMetadata: false,
  metadataError: null,
  metadataCache: new Map(),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setPlaylist: (playlist) => set({ playlist }),
  appendToPlaylist: (tracks) => 
    set((state) => ({ playlist: [...state.playlist, ...tracks] })),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  skipForward: () => {
    const { playlist, currentTrack } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    set({ 
      currentTrack: playlist[nextIndex],
      currentTime: 0,
      isPlaying: true
    });
  },
  skipBackward: () => {
    const { playlist, currentTrack } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    set({ 
      currentTrack: playlist[prevIndex],
      currentTime: 0,
      isPlaying: true
    });
  },
  setMetadata: (trackId, metadata) => 
    set((state) => {
      const newCache = new Map(state.metadataCache);
      newCache.set(trackId, metadata);
      const playlist = state.playlist.map(track => 
        track.id === trackId ? { ...track, metadata } : track
      );
      const currentTrack = state.currentTrack?.id === trackId 
        ? { ...state.currentTrack, metadata }
        : state.currentTrack;
      return { 
        metadataCache: newCache,
        playlist,
        currentTrack,
      };
    }),
  setIsLoadingMetadata: (isLoading) => set({ isLoadingMetadata: isLoading }),
  setMetadataError: (error) => set({ metadataError: error }),
}));
