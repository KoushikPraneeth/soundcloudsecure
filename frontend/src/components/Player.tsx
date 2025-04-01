import React, { useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import "./Player.css";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    skipForward,
    skipBackward,
    playlist,
  } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentTrack?.temporaryLink) {
      setIsPlaying(true);
    }
  }, [currentTrack, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  if (!currentTrack) {
    return null;
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 1 : 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const currentIndex = playlist.findIndex(
    (track) => track.id === currentTrack.id
  );
  const canSkipForward = currentIndex < playlist.length - 1;
  const canSkipBackward = currentIndex > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Progress Bar */}
      <div className="w-full h-1.5 relative">
        <input
          ref={progressRef}
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          {/* Track Info */}
          <div className="flex items-center space-x-4 w-full sm:w-auto sm:flex-1">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
              {currentTrack.metadata?.picture ? (
                <img
                  src={currentTrack.metadata.picture.data}
                  alt={currentTrack.metadata.picture.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={20} className="text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {currentTrack.metadata?.title || currentTrack.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>{currentTrack.metadata?.artist || "Unknown Artist"}</span>
                <span>•</span>
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4 w-full sm:flex-1">
            <button
              onClick={skipBackward}
              className={`p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 ${
                !canSkipBackward ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canSkipBackward}
              title="Previous Track"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={skipForward}
              className={`p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 ${
                !canSkipForward ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!canSkipForward}
              title="Next Track"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <button
              onClick={toggleMute}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              title="Volume"
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.temporaryLink}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (canSkipForward) {
            skipForward();
          } else {
            setIsPlaying(false);
          }
        }}
      />
    </div>
  );
};
