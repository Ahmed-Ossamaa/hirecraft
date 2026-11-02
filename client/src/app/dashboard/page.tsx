"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    if (user.userType === UserUserType.PLATFORM_ADMIN) {
      router.replace("/dashboard/admin");
    } else if (user.userType === UserUserType.EMPLOYER) {
      router.replace("/dashboard/company");
    } else {
      router.replace("/dashboard/profile");
    }
  }, [user, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
