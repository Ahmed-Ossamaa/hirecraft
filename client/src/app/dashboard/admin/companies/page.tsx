"use client";

import { MdBusiness } from "react-icons/md";
import { AdminCompaniesTable } from "@/features/admin/components/companies/AdminCompaniesTable";

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MdBusiness className="text-primary text-3xl" />
          Company Directory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore all registered companies, locations, active subscription tiers, and team sizes.
        </p>
      </div>

      <AdminCompaniesTable />
    </div>
  );
}

