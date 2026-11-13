import type { Metadata } from "next";
import { CompanyMachineryAnalytics } from "@/features/companies/components/analytics/CompanyMachineryAnalytics";

export const metadata: Metadata = {
  title: "Machine Market Analytics | Technically",
  description:
    "Explore platform-wide machinery job demand and skilled worker supply.",
};

export default function CompanyAnalyticsPage() {
  return <CompanyMachineryAnalytics />;
}
