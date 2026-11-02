import { Metadata } from "next";
import { BillingDashboardClient } from "@/features/billing/components/BillingDashboardClient";

export const metadata: Metadata = {
  title: "Plans & Billing | Technically",
  description: "Manage your company subscription, limits, and billing details.",
};

export default function CompanyBillingPage() {
  return <BillingDashboardClient />;
}
