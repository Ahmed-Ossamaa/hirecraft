"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth-store";
import { customAxiosInstance } from "../api/axios-instance";
import { User } from "../api/generated/model";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      const hasSession = document.cookie.includes("hasSession=true");

      if (hasSession && !isAuthenticated) {
        try {
          const refreshResponse = await customAxiosInstance<{ data: { accessToken: string } }>({
            url: "/api/v1/auth/refresh",
            method: "POST",
          });

          const accessToken = refreshResponse.data?.accessToken;
          
          if (accessToken) {
            const userResponse = await customAxiosInstance<{ data: User }>({
              url: "/api/v1/users/me",
              method: "GET",
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            const user = userResponse.data;
            if (user) {
              setAuth(accessToken, user, user.userType === 'EMPLOYER' ? user.id : null);
              setIsInitializing(false);
              return;
            }
          }
          clearAuth();
        } catch (error) {
          console.error("Failed to restore session:", error);
          clearAuth();
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [isAuthenticated, setAuth, clearAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
