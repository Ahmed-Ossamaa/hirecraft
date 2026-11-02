"use client";

import { MdGroup } from "react-icons/md";
import { AdminUsersTable } from "@/features/admin/components/users/AdminUsersTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MdGroup className="text-primary text-3xl" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all platform user profiles, verify account credentials, and enforce ban restrictions.
        </p>
      </div>

      <AdminUsersTable />
    </div>
  );
}

