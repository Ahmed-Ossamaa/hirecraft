"use client";

import { MdWorkspacePremium, MdArrowBack } from "react-icons/md";
import { AdminSubscriptionsTable } from "@/features/admin/components/billing/AdminSubscriptionsTable";

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MdWorkspacePremium className="text-primary text-3xl" />
          Subscription Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all active, cancelled, and expired company subscriptions
          across billing cycles.
        </p>
      </div>

      <AdminSubscriptionsTable />
    </div>
  );
}
