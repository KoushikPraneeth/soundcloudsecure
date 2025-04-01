import React, { useState, useEffect } from "react";
import { FolderPlus, Trash2, Pencil, Clock, Music, ChevronLeft } from "lucide-react";
import { Modal } from "./Modal";
import toast from "react-hot-toast";
import { 
  createPlaylist, 
  fetchPlaylists, 
  deletePlaylist, 
  updatePlaylist,
  fetchPlaylistTracks,
  removeTrackFromPlaylist
} from "../utils/supabase";
import { Playlist, Track } from "../types/supabase";
import { usePlayerStore } from "../store/playerStore";

interface PlaylistFormData {
  name: string;
  description: string;
}

export const Playlists: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: "",
    description: "",
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const { setCurrentTrack } = usePlayerStore();

  useEffect(() => {
    loadPlaylists();
  }, []);
  
  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistTracks(selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPlaylists();
      setPlaylists(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load playlists';
      setError(errorMessage);
      toast(errorMessage, {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b'
        }
      });
      console.error('Error loading playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPlaylistTracks = async (playlistId: string) => {
    try {
      setIsLoadingTracks(true);
      setError(null);
      const data = await fetchPlaylistTracks(playlistId);
      // Extract tracks from the response
      const tracks = data.map((item: any) => item.tracks);
      setPlaylistTracks(tracks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load playlist tracks';
      setError(errorMessage);
      toast(errorMessage, {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b'
        }
      });
      console.error('Error loading playlist tracks:', err);
    } finally {
      setIsLoadingTracks(false);
    }
  };
  
  const handleRemoveTrack = async (trackId: string) => {
    if (!selectedPlaylist) return;
    
    try {
      await removeTrackFromPlaylist(selectedPlaylist.id, trackId);
      // Reload playlist tracks
      await loadPlaylistTracks(selectedPlaylist.id);
      toast('Track removed from playlist', {
        icon: '✅',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove track';
      toast(errorMessage, {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b'
        }
      });
      console.error('Error removing track from playlist:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, formData);
      } else {
        await createPlaylist(formData.name, formData.description);
      }
      
      await loadPlaylists();
      setFormData({ name: "", description: "" });
      setEditingPlaylist(null);
      setIsModalOpen(false);

      const action = editingPlaylist ? 'updated' : 'created';
      toast(`Playlist ${action} successfully!`, {
        icon: '✅',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save playlist';
      setError(errorMessage);
      toast(errorMessage, {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b'
        }
      });
      console.error("Failed to save playlist:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      setError(null);
      await deletePlaylist(id);
      await loadPlaylists();
      toast('Playlist deleted successfully!', {
        icon: '🗑️',
        duration: 3000
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete playlist';
      setError(errorMessage);
      toast(errorMessage, {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b'
        }
      });
      console.error("Failed to delete playlist:", err);
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setFormData({
      name: playlist.name,
      description: playlist.description || "",
    });
    setEditingPlaylist(playlist);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({ name: "", description: "" });
    setEditingPlaylist(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      {selectedPlaylist ? (
        // Playlist tracks view
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="mr-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                {selectedPlaylist.name}
              </h2>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {isLoadingTracks ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading tracks...</p>
            </div>
          ) : playlistTracks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No tracks in this playlist
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add tracks from your library to this playlist
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlistTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-4"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => setCurrentTrack(track as any)}
                    >
                      {track.picture ? (
                        <img
                          src={track.picture.data}
                          alt={track.picture.description || 'Album art'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music size={20} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4 flex-1 cursor-pointer" onClick={() => setCurrentTrack(track as any)}>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {track.title || track.dropbox_id.split('/').pop()}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {track.artist || 'Unknown Artist'}
                        {track.album && ` • ${track.album}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Remove from playlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Playlists list view
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Playlists
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <FolderPlus className="h-5 w-5 mr-2" />
              New Playlist
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading playlists...</p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <FolderPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No playlists
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new playlist
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {playlist.name}
                        </h3>
                        {playlist.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {playlist.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(playlist);
                          }}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(playlist.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        Created {new Date(playlist.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingPlaylist ? "Edit Playlist" : "Create New Playlist"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="My Awesome Playlist"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Enter a description for your playlist..."
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (editingPlaylist ? "Saving..." : "Creating...") 
                : (editingPlaylist ? "Save Changes" : "Create Playlist")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
