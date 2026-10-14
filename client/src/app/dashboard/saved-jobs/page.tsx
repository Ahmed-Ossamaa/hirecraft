import { Metadata } from "next";
import { SavedJobsList } from "@/features/jobs/components/SavedJobsList";

export const metadata: Metadata = {
  title: "Saved Jobs | Technically",
  description: "Manage and apply to your saved industrial jobs.",
};

export default function SavedJobsPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
      <div>
        <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
          Saved Jobs
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Jobs you've bookmarked to review or apply for later.
        </p>
      </div>

      <SavedJobsList />
    </div>
  );
}
