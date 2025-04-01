import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Library } from './components/Library';
import { Settings } from './components/Settings';
import { Toaster } from "react-hot-toast";
import { Playlists } from './components/Playlists';
import { AuthCallback } from './components/AuthCallback';
import { useAuthStore } from './store/authStore';
import { Player } from './components/Player';
import { TrackDetail } from './components/TrackDetail';
import { usePlayerStore } from './store/playerStore';
import { RefreshCw } from 'lucide-react';
import useSupabaseAuthStore from './store/supabaseAuthStore';
import { signInWithOAuth } from './utils/supabase';
import { SupabaseAuthCallback } from './components/SupabaseAuthCallback';
import Profile from './components/Profile';

// Protected route wrapper
const ProtectedLayout = () => {
  const { user: supabaseUser, isLoading: isSupabaseAuthenticating } =
    useSupabaseAuthStore();
  const { currentTrack } = usePlayerStore();

  if (isSupabaseAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <RefreshCw
            className="mx-auto mb-4 text-blue-600 dark:text-blue-400 animate-spin"
            size={48}
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authenticating...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  if (!supabaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to SoundVaultPro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to access your music
          </p>
          <button
            onClick={signInWithOAuth}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<Library />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
      {currentTrack && (
        <>
          <Player />
          <TrackDetail />
        </>
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
            duration: 5000,
          }
        }}
      />
      <Routes>
        <Route path="/auth/dropbox/callback" element={<AuthCallback />} />
        <Route
          path="/auth/supabase/callback"
          element={<SupabaseAuthCallback />}
        />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}
