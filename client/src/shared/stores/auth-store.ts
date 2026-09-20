import { create } from "zustand";
import { setClientCookie, removeClientCookie } from "../lib/cookies";
import { User } from "../api/generated/model";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  organizationId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user?: User | null, orgId?: string | null) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setOrganizationId: (orgId: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  organizationId: null,
  isAuthenticated: false,

  setAuth: (token, user = null, orgId = null) => {
    setClientCookie("hasSession", "true");
    set({
      accessToken: token,
      user,
      organizationId: orgId,
      isAuthenticated: true,
    });
  },

  setAccessToken: (token) => {
    setClientCookie("hasSession", "true");
    set({
      accessToken: token,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setOrganizationId: (orgId) => {
    set({ organizationId: orgId });
  },

  clearAuth: () => {
    removeClientCookie("hasSession");
    set({
      accessToken: null,
      user: null,
      organizationId: null,
      isAuthenticated: false,
    });
  },
}));
