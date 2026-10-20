import { Metadata } from "next";
import { EmployerJobsList } from "@/features/jobs/components/employer/EmployerJobsList";
import { MdWork } from "react-icons/md";

export const metadata: Metadata = {
  title: "Company Jobs | Technically",
  description: "Manage your job postings and applicants.",
};

export default function EmployerJobsPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdWork className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Job Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, edit, and manage your job postings and applicants.
          </p>
        </div>
      </div>

      <EmployerJobsList />
    </div>
  );
}
