"use client";

import { Sidebar } from "@/shared/components/layout/Sidebar";
import { DashboardTopBar } from "@/shared/components/layout/DashboardTopBar";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/auth?from=/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  // Dont render until auth state is checked
  if (!ready || !isAuthenticated) {
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
        <DashboardTopBar />
        <main className="flex-1 p-2 md:p-6">{children}</main>
      </div>
    </div>
  );
}
