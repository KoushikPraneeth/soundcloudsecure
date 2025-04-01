import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { handleAuthCallback } from "../utils/dropbox";
import { useAuthStore } from "../store/authStore";
import { RefreshCw } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { error, isAuthenticated, isAuthenticating } = useAuthStore();
  const hasHandledRef = useRef(false);

  // Clear query parameters after successful auth
  const clearQueryParams = () => {
    const newUrl = `${location.pathname}${location.hash}`;
    window.history.replaceState({}, "", newUrl);
  };

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const state = searchParams.get("state");

    console.log("Auth callback params:", { code, error: errorParam, state });

    // Skip if already authenticated or already handled
    if (isAuthenticated || hasHandledRef.current) {
      console.log("Skipping auth callback: Already authenticated or handled");
      navigate("/");
      return;
    }

    if (errorParam) {
      console.error("Dropbox auth error:", errorParam);
      useAuthStore.getState().setAuth({
        error: `Authentication failed: ${errorParam}`,
        isAuthenticating: false,
      });
      navigate("/");
      return;
    }

    if (code) {
      hasHandledRef.current = true;
      console.log("Handling auth code...");
      useAuthStore.getState().setAuth({ isAuthenticating: true });

      handleAuthCallback(code)
        .then(() => {
          console.log("Auth successful, redirecting...");
          clearQueryParams();
          navigate("/");
        })
        .catch((error) => {
          console.error("Auth callback error:", error);
          useAuthStore.getState().setAuth({
            error:
              error instanceof Error ? error.message : "Authentication failed",
            isAuthenticating: false,
          });
          navigate("/");
        });
    } else {
      console.error("No code or error in callback");
      useAuthStore.getState().setAuth({
        error: "No authorization code received",
        isAuthenticating: false,
      });
      navigate("/");
    }
  }, [
    searchParams,
    navigate,
    isAuthenticated,
    location.pathname,
    location.hash,
  ]);

  if (isAuthenticating) {
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
            Connecting your Dropbox account
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {error}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Authenticating...
        </h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
      </div>
    </div>
  );
};
