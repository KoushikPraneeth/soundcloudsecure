import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, List, Settings, Moon, Sun, LogOut, User } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import useSupabaseAuthStore from '../store/supabaseAuthStore';
import { signOut } from '../utils/supabase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user: supabaseUser } = useSupabaseAuthStore();

  const navItems = [
    { path: '/', label: 'Library', icon: Music },
    { path: '/playlists', label: 'Playlists', icon: List },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          SoundVaultPro
        </h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
        >
          <List size={24} />
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)] md:h-screen">
        {/* Sidebar - responsive */}
        <div 
          className={`fixed md:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-y-auto`}
        >
          <div className="p-4 md:block hidden">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              SoundVaultPro
            </h1>
          </div>

          <nav className="mt-4 md:mt-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors
                  ${
                    location.pathname === path
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon size={18} className="mr-3" />
                {label}
              </button>
            ))}
            {supabaseUser && (
              <button
                onClick={() => {
                  signOut();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={18} className="mr-3" />
                Sign Out
              </button>
            )}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
            >
              {isDarkMode ? (
                <>
                  <Sun size={18} className="mr-3" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={18} className="mr-3" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main content - responsive */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <main className="h-full">{children}</main>
        </div>
      </div>
    </div>
  );
};
