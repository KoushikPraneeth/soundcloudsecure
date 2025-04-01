import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { uploadFile } from '../utils/dropbox';
import { usePlayerStore } from '../store/playerStore';
import { Track } from '../types';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { appendToPlaylist } = usePlayerStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const audioFiles = selectedFiles.filter(file => 
        file.type.startsWith('audio/') || 
        ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.opus'].some(ext => file.name.toLowerCase().endsWith(ext))
      );
      
      setFiles(prev => [...prev, ...audioFiles]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const initialStatus: Record<string, 'pending' | 'success' | 'error'> = {};
    const initialProgress: Record<string, number> = {};
    
    files.forEach(file => {
      initialStatus[file.name] = 'pending';
      initialProgress[file.name] = 0;
    });
    
    setUploadStatus(initialStatus);
    setUploadProgress(initialProgress);
    
    const uploadedTracks: Track[] = [];
    
    for (const file of files) {
      try {
        // Upload the file with progress tracking
        const track = await uploadFile(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        });
        
        // Update status
        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
        
        // Show success toast
        toast.success(`${file.name} uploaded successfully!`, {
          duration: 3000,
          position: 'top-center',
        });
        
        if (track) {
          uploadedTracks.push(track);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrorMessages(prev => ({ ...prev, [file.name]: errorMessage }));
        
        // Show error toast
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`, {
          duration: 5000,
          position: 'top-center',
        });
      }
    }
    
    // Add successfully uploaded tracks to the playlist
    if (uploadedTracks.length > 0) {
      appendToPlaylist(uploadedTracks);
      
      // Show summary toast if multiple files were uploaded
      if (uploadedTracks.length > 1) {
        toast.success(`${uploadedTracks.length} files uploaded successfully!`, {
          duration: 3000,
          position: 'top-center',
          icon: '🎵',
        });
      }
    }
    
    setUploading(false);
  };

  const allCompleted = files.length > 0 && 
    files.every(file => uploadStatus[file.name] === 'success' || uploadStatus[file.name] === 'error');

  const resetUpload = () => {
    setFiles([]);
    setUploadProgress({});
    setUploadStatus({});
    setErrorMessages({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Music</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {!uploading && files.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="mx-auto mb-4 text-blue-500" size={48} />
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Select audio files to upload to your Dropbox
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.opus"
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-block"
              >
                Select Files
              </label>
            </div>
          ) : (
            <>
              <div className="mb-4 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      
                      {uploadStatus[file.name] && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                uploadStatus[file.name] === 'error' 
                                  ? 'bg-red-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${uploadProgress[file.name] || 0}%` }}
                            ></div>
                          </div>
                          
                          {uploadStatus[file.name] === 'error' && (
                            <p className="text-xs text-red-500 mt-1">{errorMessages[file.name]}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {!uploading ? (
                        <button 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      ) : (
                        <div>
                          {uploadStatus[file.name] === 'pending' && (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {uploadStatus[file.name] === 'success' && (
                            <Check size={16} className="text-green-500" />
                          )}
                          {uploadStatus[file.name] === 'error' && (
                            <AlertCircle size={16} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!uploading && !allCompleted && (
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Add More
                  </button>
                  <button
                    onClick={handleUpload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    disabled={files.length === 0}
                  >
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </button>
                </div>
              )}
              
              {allCompleted && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Upload More Files
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}
              
              {uploading && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uploading... Please don't close this window.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
