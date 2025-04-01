import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupabaseAuthStore from '../store/supabaseAuthStore';
import { handleSupabaseCallback } from '../utils/supabase';
import toast from 'react-hot-toast';
import { userApi } from '../utils/api';

export const SupabaseAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, setUser } = useSupabaseAuthStore();

  useEffect(() => {
    async function handleCallback() {
      const loadingToast = toast.loading('Signing you in...', {
        position: 'top-center'
      });
      
      try {
        const session = await handleSupabaseCallback();
        if (session) {
          // Set both session and user state before navigation
          setSession(session);
          setUser(session.user);
          
          // Register user with backend
          try {
            await userApi.registerUser({
              supabaseId: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email || 'User',
              profilePicture: session.user.user_metadata?.avatar_url
            });
            console.log('User registered with backend');
          } catch (error) {
            console.error('Error registering user with backend:', error);
            // Continue with login even if backend registration fails
          }
          
          toast.dismiss(loadingToast);
          toast.success('Successfully signed in!', {
            icon: '🎉',
            duration: 3000
          });
          
          // Small delay to ensure state is updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.dismiss(loadingToast);
        toast.error('Failed to sign in. Please try again.', {
          icon: '❌',
          duration: 5000
        });
        navigate('/');
      }
    }

    handleCallback();
  }, [navigate, setSession, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
};
