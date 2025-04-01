import * as mmb from 'music-metadata-browser';
import { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';

export interface Picture {
  data: string;
  format: string;
  type: string;
  description: string;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  picture?: Picture;
}

// Rate limiting configuration
const CONCURRENT_REQUESTS = 3;
const REQUEST_DELAY = 500; // ms between requests

// Helper function to convert Uint8Array to base64 string
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const defaultPicture: Picture = {
  data: `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <path d="M100 65c-19.33 0-35 15.67-35 35s15.67 35 35 35 35-15.67 35-35-15.67-35-35-35zm0 60c-13.785 0-25-11.215-25-25s11.215-25 25-25 25 11.215 25 25-11.215 25-25 25z" fill="#9ca3af"/>
      <circle cx="100" cy="100" r="10" fill="#9ca3af"/>
      <path d="M100 40v-10" stroke="#9ca3af" stroke-width="4"/>
      <path d="M100 170v-10" stroke="#9ca3af" stroke-width="4"/>
      <path d="M40 100h-10" stroke="#9ca3af" stroke-width="4"/>
      <path d="M170 100h-10" stroke="#9ca3af" stroke-width="4"/>
    </svg>
  `)}`,
  format: 'image/svg+xml',
  type: 'Front Cover',
  description: 'Default Album Art',
};

const getBase64Picture = (picture: mmb.IPicture): Picture => {
  return {
    data: `data:${picture.format};base64,${uint8ArrayToBase64(picture.data)}`,
    format: picture.format,
    type: picture.type || 'Front Cover',
    description: picture.description || 'Album Art',
  };
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Process tracks in batches with rate limiting
export const processMetadata = async (tracks: Track[]): Promise<AudioMetadata[]> => {
  const results: AudioMetadata[] = [];
  const batches = [];
  
  // Split tracks into batches
  for (let i = 0; i < tracks.length; i += CONCURRENT_REQUESTS) {
    batches.push(tracks.slice(i, i + CONCURRENT_REQUESTS));
  }

  // Process each batch
  for (const batch of batches) {
    const batchPromises = batch.map(track => getMetadata(track));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches
    if (batches.indexOf(batch) < batches.length - 1) {
      await delay(REQUEST_DELAY);
    }
  }

  return results;
};

export const getMetadata = async (track: Track): Promise<AudioMetadata> => {
  const playerStore = usePlayerStore.getState();

  // Check cache first
  if (playerStore.metadataCache.has(track.id)) {
    return playerStore.metadataCache.get(track.id)!;
  }

  playerStore.setIsLoadingMetadata(true);
  playerStore.setMetadataError(null);

  try {
    // Fetch audio data
    const response = await fetch(track.temporaryLink);
    if (!response.ok) {
      throw new Error('Failed to fetch audio data');
    }

    const buffer = await response.arrayBuffer();
    const metadata = await mmb.parseBuffer(
      new Uint8Array(buffer),
      track.name.split('.').pop() || 'mp3'
    );

    const audioMetadata: AudioMetadata = {
      title: metadata.common.title || track.name,
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      year: metadata.common.year?.toString() || '',
      genre: metadata.common.genre?.join(', ') || '',
      picture: metadata.common.picture?.[0]
        ? getBase64Picture(metadata.common.picture[0])
        : defaultPicture,
    };

    // Cache the metadata
    playerStore.setMetadata(track.id, audioMetadata);
    return audioMetadata;
  } catch (error) {
    console.error('Error parsing metadata:', error);

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        playerStore.setMetadataError(
          'Failed to load track data. Please check your internet connection and try again.'
        );
      } else {
        playerStore.setMetadataError(
          'Failed to read track information. The file might be corrupted or in an unsupported format.'
        );
      }
    }

    // Return default metadata on error
    const defaultMetadata: AudioMetadata = {
      title: track.name,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      year: '',
      genre: '',
      picture: defaultPicture,
    };

    playerStore.setMetadata(track.id, defaultMetadata);
    return defaultMetadata;
  } finally {
    playerStore.setIsLoadingMetadata(false);
  }
};
