import { AudioMetadata } from './utils/metadata';

export class DropboxError extends Error {
  constructor(
    message: string,
    public code: string = 'unknown_error',
    public description?: string
  ) {
    super(message);
    this.name = 'DropboxError';
  }
}

export interface Track {
  id: string;
  name: string;
  path: string;
  temporaryLink: string;
  encryptedKey?: string;
  iv?: string;
  metadata?: AudioMetadata;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playlist: Track[];
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | null;
  currentTime: number;
  duration: number;
  isLoadingMetadata: boolean;
  metadataError: string | null;
  metadataCache: Map<string, AudioMetadata>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  error: string | null;
}

export interface DropboxAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  uid: string;
  account_id: string;
}

export interface DropboxListFolderResponse {
  entries: Array<{
    '.tag': string;
    name: string;
    path_display: string;
    id: string;
  }>;
  cursor: string;
  has_more: boolean;
}
