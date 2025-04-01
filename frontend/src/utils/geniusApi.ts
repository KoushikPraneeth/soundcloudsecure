import axios from 'axios';

// Genius API constants
const GENIUS_API_BASE_URL = 'https://api.genius.com';
const GENIUS_ACCESS_TOKEN = import.meta.env.VITE_GENIUS_ACCESS_TOKEN;

// Create an axios instance with the Genius API configuration
const geniusApiClient = axios.create({
  baseURL: GENIUS_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
  }
});

/**
 * Search for songs on Genius by title and artist
 */
export const searchSong = async (title: string, artist?: string): Promise<any> => {
  try {
    const query = artist ? `${title} ${artist}` : title;
    const response = await geniusApiClient.get('/search', {
      params: {
        q: query
      }
    });
    
    return response.data.response.hits;
  } catch (error) {
    console.error('Error searching song on Genius:', error);
    throw error;
  }
};

/**
 * Get song details by Genius song ID
 */
export const getSongDetails = async (songId: number): Promise<any> => {
  try {
    const response = await geniusApiClient.get(`/songs/${songId}`);
    return response.data.response.song;
  } catch (error) {
    console.error('Error getting song details from Genius:', error);
    throw error;
  }
};

/**
 * Extract lyrics from Genius song page HTML
 * Note: This requires a proxy server or CORS workaround as Genius doesn't provide lyrics directly via API
 */
export const extractLyricsFromHtml = (html: string): string => {
  // This is a simplified approach - in production, you might want to use a more robust HTML parser
  const lyricsDiv = html.split('<div class="lyrics">')[1]?.split('</div>')[0];
  if (lyricsDiv) {
    return lyricsDiv.replace(/<[^>]*>/g, '').trim();
  }
  
  // Alternative approach for newer Genius page structure
  const lyricsContainers = html.match(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/g);
  if (lyricsContainers && lyricsContainers.length > 0) {
    return lyricsContainers
      .map(container => container.replace(/<[^>]*>/g, '').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n'); // Clean up excessive newlines
  }
  
  return '';
};
