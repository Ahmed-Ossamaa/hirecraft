"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/stores/auth-store";
import { toast } from "sonner";

interface UseLogoutOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useLogout(options?: UseLogoutOptions) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // Call Nextjs BFF route to clear httpOnly cookies and notify backend
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      clearAuth();

      // Clear cache to prevent cross-account data leakage
      queryClient.clear();

      options?.onSuccess?.();

      //Redirect and refresh
      const target = options?.redirectTo ?? "/";
      router.push(target);
      router.refresh();

      toast.success("Logged out successfully", { duration: 500 });
    } catch (error) {
      console.error("Logout failed:", error);
      clearAuth();
      queryClient.clear();
      router.push(options?.redirectTo ?? "/");
      toast.error("Failed to logout completely");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
