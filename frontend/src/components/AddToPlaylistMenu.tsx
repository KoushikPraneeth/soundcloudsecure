import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Loader, Check } from 'lucide-react';
import { fetchPlaylists, addTrackToPlaylist } from '../utils/supabase';
import { Playlist } from '../types/supabase';
import { Track } from '../types';
import toast from 'react-hot-toast';

interface AddToPlaylistMenuProps {
  track: Track;
  onClose: () => void;
}

export const AddToPlaylistMenu: React.FC<AddToPlaylistMenuProps> = ({ track, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoading(true);
        const data = await fetchPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error('Error loading playlists:', err);
        setError('Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const handleAddToPlaylist = async (playlist: Playlist) => {
    try {
      setAddingToPlaylist(playlist.id);
      
      // We need to ensure the track is saved in the tracks table first
      // This would typically be handled by a backend endpoint
      // For now, we'll assume the track ID from Dropbox can be used
      
      await addTrackToPlaylist(playlist.id, track.id);
      
      toast.success(`Added to "${playlist.name}" playlist`, {
        duration: 3000,
        position: 'top-center',
      });
      
      onClose();
    } catch (err) {
      console.error('Error adding to playlist:', err);
      toast.error('Failed to add to playlist', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setAddingToPlaylist(null);
    }
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          Add to Playlist
        </div>
        
        {loading ? (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Loader size={16} className="animate-spin mr-2" />
            Loading playlists...
          </div>
        ) : error ? (
          <div className="px-4 py-3 text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : playlists.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            No playlists found. Create a playlist first.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                onClick={() => handleAddToPlaylist(playlist)}
                disabled={addingToPlaylist !== null}
              >
                <span className="truncate">{playlist.name}</span>
                {addingToPlaylist === playlist.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
