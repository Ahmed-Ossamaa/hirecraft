import { create } from "zustand";
import { setClientCookie, removeClientCookie } from "../lib/cookies";
import { User } from "../api/generated/model";
import { AUTH_COOKIES } from "../constants/auth";

interface AuthState {
  user: User | null;
  organizationId: string | null;
  companyRole: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user?: User | null, orgId?: string | null, role?: string | null) => void;
  setUser: (user: User | null) => void;
  setOrganizationId: (orgId: string | null) => void;
  setHydrated: (isHydrated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizationId: null,
  companyRole: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user = null, orgId = null, role = null) => {
    setClientCookie(AUTH_COOKIES.HAS_SESSION, "true");
    set({
      user,
      organizationId: orgId,
      companyRole: role,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setOrganizationId: (orgId) => {
    set({ organizationId: orgId });
  },

  setHydrated: (isHydrated) => {
    set({ isHydrated });
  },

  clearAuth: () => {
    removeClientCookie(AUTH_COOKIES.HAS_SESSION);
    set({
      user: null,
      organizationId: null,
      companyRole: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },
}));
