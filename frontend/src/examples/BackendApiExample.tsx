import React, { useEffect, useState } from 'react';
import { userApi, playlistApi } from '../utils/api';
import useSupabaseAuthStore from '../store/supabaseAuthStore';

/**
 * This is an example component showing how to use the backend API
 * You can use this as a reference for integrating the backend with your frontend
 */
const BackendApiExample: React.FC = () => {
  const { user } = useSupabaseAuthStore();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if user is logged in
    if (user) {
      fetchUserProfile();
      fetchPlaylists();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await userApi.getUserBySupabaseId(user?.id || '');
      setUserProfile(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const userPlaylists = await playlistApi.getPlaylists(user?.id || '');
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const createNewPlaylist = async () => {
    try {
      const name = prompt('Enter playlist name:');
      if (!name) return;
      
      const newPlaylist = await playlistApi.createPlaylist(
        user?.id || '', 
        name,
        'Created from frontend'
      );
      
      // Refresh playlists
      fetchPlaylists();
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Failed to create playlist');
    }
  };

  const saveEncryptionKeys = async () => {
    try {
      // In a real app, you would generate these keys securely
      // This is just a demonstration
      const publicKey = 'example-public-key-' + Date.now();
      const encryptedPrivateKey = 'example-encrypted-private-key-' + Date.now();
      
      await userApi.saveKeys(user?.id || '', publicKey, encryptedPrivateKey);
      
      // Refresh user profile
      fetchUserProfile();
    } catch (err) {
      console.error('Error saving keys:', err);
      setError('Failed to save encryption keys');
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to use the backend API</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Backend API Example</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">User Profile</h3>
        {loading ? (
          <p>Loading user profile...</p>
        ) : userProfile ? (
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Name:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Public Key:</strong> {userProfile.publicKey || 'Not set'}</p>
          </div>
        ) : (
          <p>No user profile found</p>
        )}
        
        <button 
          onClick={saveEncryptionKeys}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Example Encryption Keys
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Playlists</h3>
          <button 
            onClick={createNewPlaylist}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Create Playlist
          </button>
        </div>
        
        {loading ? (
          <p>Loading playlists...</p>
        ) : playlists.length > 0 ? (
          <ul className="bg-gray-100 p-4 rounded">
            {playlists.map(playlist => (
              <li key={playlist.id} className="mb-2">
                <strong>{playlist.name}</strong>
                {playlist.description && <p className="text-sm text-gray-600">{playlist.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No playlists found</p>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mt-8">
        <p>This example demonstrates how to:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Fetch user profile from the backend</li>
          <li>Save encryption keys to the backend</li>
          <li>Fetch and create playlists</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendApiExample;
