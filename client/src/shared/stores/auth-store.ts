import { create } from "zustand";
import { setClientCookie, removeClientCookie } from "../lib/cookies";
import { User } from "../api/generated/model";

interface AuthState {
  user: User | null;
  organizationId: string | null;
  companyRole: string | null;
  isAuthenticated: boolean;
  setAuth: (user?: User | null, orgId?: string | null, role?: string | null) => void;
  setUser: (user: User | null) => void;
  setOrganizationId: (orgId: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizationId: null,
  companyRole: null,
  isAuthenticated: false,

  setAuth: (user = null, orgId = null, role = null) => {
    setClientCookie("hasSession", "true");
    set({
      user,
      organizationId: orgId,
      companyRole: role,
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
      user: null,
      organizationId: null,
      companyRole: null,
      isAuthenticated: false,
    });
  },
}));
