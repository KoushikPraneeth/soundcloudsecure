import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "../types";

interface AuthStore extends AuthState {
  setAuth: (auth: Partial<AuthState>) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (auth) => set((state) => ({ ...state, ...auth })),
      clearAuth: () => set(initialState),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        isAuthenticating: state.isAuthenticating,
      }),
    }
  )
);
