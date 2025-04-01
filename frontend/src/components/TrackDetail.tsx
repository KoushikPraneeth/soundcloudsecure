import React, { useState } from 'react';
import { Music, Info, X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { Lyrics } from './Lyrics';

export const TrackDetail: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTrack } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const trackName = currentTrack.metadata?.title || currentTrack.name;
  const artist = currentTrack.metadata?.artist || 'Unknown Artist';

  return (
    <>
      {/* Button to open track details */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-24 right-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg z-10"
        title="Track Details"
      >
        <Info size={20} />
      </button>

      {/* Track details panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 transition-opacity duration-300">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-xl transition-transform duration-300 transform">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Track Details</h2>
              <button
                onClick={toggleOpen}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {/* Track cover */}
              <div className="mb-6 flex justify-center">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                  {currentTrack.metadata?.picture ? (
                    <img
                      src={currentTrack.metadata.picture.data}
                      alt={currentTrack.metadata.picture.description || 'Album cover'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={48} className="text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>

              {/* Track info */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{trackName}</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">{artist}</p>
                
                {currentTrack.metadata?.album && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Album: {currentTrack.metadata.album}
                  </p>
                )}
                
                {currentTrack.metadata?.year && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Year: {currentTrack.metadata.year}
                  </p>
                )}
                
                {currentTrack.metadata?.genre && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Genre: {currentTrack.metadata.genre}
                  </p>
                )}
              </div>

              {/* Lyrics */}
              <div className="mt-8">
                <Lyrics trackName={trackName} artist={artist} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
