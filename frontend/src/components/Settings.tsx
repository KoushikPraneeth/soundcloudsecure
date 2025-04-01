import React from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { getAuthUrl, revokeAccess } from "../utils/dropbox";

export const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isAuthenticated, error } = useAuthStore();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await revokeAccess();
      } catch (error) {
        console.error("Error disconnecting from Dropbox:", error);
      }
    } else {
      try {
        const authUrl = await getAuthUrl();
        window.location.href = authUrl;
      } catch (error) {
        console.error("Error generating auth URL:", error);
      }
    }
  };

  const handleReconnect = async () => {
    try {
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error generating auth URL:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h2>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Appearance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Dropbox Connection */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Dropbox Connection
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your Dropbox connection
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleAuthAction}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    isAuthenticated
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isAuthenticated
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {isAuthenticated ? "Disconnect Dropbox" : "Connect Dropbox"}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={handleReconnect}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Reconnect Dropbox
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {isAuthenticated
                  ? "Your Dropbox account is connected. You can disconnect or reconnect at any time."
                  : "Connect your Dropbox account to access your music library."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
