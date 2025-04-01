import React from 'react';
import useSupabaseAuthStore from '../store/supabaseAuthStore';
import { User } from 'lucide-react';

const Profile = () => {
  const { user } = useSupabaseAuthStore();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
            <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account ID</h3>
            <p className="mt-1 text-gray-900 dark:text-white font-mono text-sm">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
