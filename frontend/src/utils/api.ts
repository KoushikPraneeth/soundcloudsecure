import { supabase } from './supabase';

const API_URL = 'http://localhost:8080/api';

/**
 * Base API service for making requests to the backend
 */
export const api = {
  /**
   * Make a GET request to the backend
   */
  async get(endpoint: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a POST request to the backend
   */
  async post(endpoint: string, body: any) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a PUT request to the backend
   */
  async put(endpoint: string, body: any) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a DELETE request to the backend
   */
  async delete(endpoint: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
};

/**
 * User API service
 */
export const userApi = {
  /**
   * Register or update a user with the backend
   */
  async registerUser(userData: {
    supabaseId: string;
    email: string;
    name: string;
    profilePicture?: string;
  }) {
    return api.post('/auth/register', userData);
  },
  
  /**
   * Get user by Supabase ID
   */
  async getUserBySupabaseId(supabaseId: string) {
    return api.get(`/users/${supabaseId}`);
  },
  
  /**
   * Save user encryption keys
   */
  async saveKeys(supabaseId: string, publicKey: string, encryptedPrivateKey: string) {
    return api.post(`/users/${supabaseId}/keys`, {
      publicKey,
      encryptedPrivateKey
    });
  }
};

/**
 * Playlist API service
 */
export const playlistApi = {
  /**
   * Get all playlists for a user
   */
  async getPlaylists(supabaseId: string) {
    return api.get(`/playlists?supabaseId=${supabaseId}`);
  },
  
  /**
   * Create a new playlist
   */
  async createPlaylist(supabaseId: string, name: string, description?: string) {
    return api.post(`/playlists?supabaseId=${supabaseId}`, {
      name,
      description
    });
  },
  
  /**
   * Update a playlist
   */
  async updatePlaylist(playlistId: number, supabaseId: string, name: string, description?: string) {
    return api.put(`/playlists/${playlistId}?supabaseId=${supabaseId}`, {
      name,
      description
    });
  },
  
  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: number, supabaseId: string) {
    return api.delete(`/playlists/${playlistId}?supabaseId=${supabaseId}`);
  }
};
