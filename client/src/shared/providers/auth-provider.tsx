'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { customAxiosInstance } from '../api/axios-instance';
import { User } from '../api/generated/model';
import { AUTH_COOKIES } from '../constants/auth';
import { getAuthTokenClaims } from '../utils/auth-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, clearAuth, setHydrated } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const hasSession = document.cookie.includes(
        `${AUTH_COOKIES.HAS_SESSION}=true`,
      );

      if (!hasSession) {
        setHydrated(true);
        return;
      }

      if (!isAuthenticated) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const accessToken = data.accessToken;

            if (accessToken) {
              const userResponse = await customAxiosInstance<{ data: User }>({
                url: '/api/v1/users/me',
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              const user = userResponse.data;
              if (user) {
                const { companyId, role } = getAuthTokenClaims(accessToken);
                setAuth(user, companyId, role);
                return;
              }
            }
          }
          clearAuth();
        } catch {
          clearAuth();
        }
      } else {
        setHydrated(true);
      }
    };

    initializeAuth();
  }, [isAuthenticated, setAuth, clearAuth, setHydrated]);

  return <>{children}</>;
}
