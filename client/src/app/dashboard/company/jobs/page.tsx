import { Metadata } from "next";
import { EmployerJobsList } from "@/features/jobs/components/employer/EmployerJobsList";

export const metadata: Metadata = {
  title: "Company Jobs | Technically",
  description: "Manage your job postings and applicants.",
};

export default function EmployerJobsPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <EmployerJobsList />
    </div>
  );
}

