import { api } from './api';

interface GeniusSongResult {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  lyricsUrl: string;
}

interface GeniusSongDetails {
  id: number;
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  imageUrl: string;
  lyricsUrl: string;
  lyricsState?: string;
}

/**
 * Lyrics API service using Genius API
 */
export const lyricsApi = {
  /**
   * Search for lyrics by track name and artist
   */
  async searchLyrics(trackName: string, artist: string): Promise<string | null> {
    try {
      // First search for the song on Genius
      const query = `${trackName} ${artist}`.trim();
      const searchResponse = await api.get(`/genius/search?query=${encodeURIComponent(query)}`);
      
      if (!searchResponse || !Array.isArray(searchResponse) || searchResponse.length === 0) {
        console.log('No search results found for:', query);
        return null;
      }
      
      // Get the first result
      const firstResult = searchResponse[0] as GeniusSongResult;
      
      // Get the song details
      const songDetails = await api.get(`/genius/songs/${firstResult.id}`) as GeniusSongDetails;
      
      if (!songDetails || !songDetails.lyricsUrl) {
        console.log('No lyrics URL found for song:', firstResult.title);
        return null;
      }
      
      // For now, we can't directly fetch the lyrics from the Genius website due to CORS
      // In a real application, you would need a backend proxy to fetch the lyrics
      // For now, we'll return a placeholder message with a link
      return `Lyrics for "${songDetails.title}" by ${songDetails.artist} are available on Genius.\n\nPlease visit: ${songDetails.lyricsUrl}`;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  },
  
  /**
   * Search for songs on Genius
   */
  async searchSongs(query: string): Promise<GeniusSongResult[]> {
    try {
      const response = await api.get(`/genius/search?query=${encodeURIComponent(query)}`);
      return response as GeniusSongResult[];
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  },
  
  /**
   * Get song details from Genius
   */
  async getSongDetails(songId: number): Promise<GeniusSongDetails | null> {
    try {
      const response = await api.get(`/genius/songs/${songId}`);
      return response as GeniusSongDetails;
    } catch (error) {
      console.error('Error getting song details:', error);
      return null;
    }
  }
};
