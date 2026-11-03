"use client";

import { Sidebar } from "@/shared/components/layout/Sidebar";
import { useAuthStore } from "@/shared/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(`/auth?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  // Don't render until auth state is fully hydrated and verified
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      <div className={`${collapsed ? "ml-17" : "ml-17 md:ml-60"} transition-all duration-300 flex flex-col min-h-screen`}>
        <main className="flex-1 p-3 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
