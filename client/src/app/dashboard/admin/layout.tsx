"use client";

import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.userType !== UserUserType.PLATFORM_ADMIN) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.userType !== UserUserType.PLATFORM_ADMIN) {
    return null;
  }

  return <div className="space-y-6">{children}</div>;
}
