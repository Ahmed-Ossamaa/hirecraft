import { Metadata } from "next";
import { ApplicationsList } from "@/features/applications/components/ApplicationsList";

export const metadata: Metadata = {
  title: "My Applications | Technically",
  description: "Track your industrial job applications.",
};

export default function ApplicationsPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
      <div>
        <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track the status of roles you've applied for.
        </p>
      </div>

      <ApplicationsList />
    </div>
  );
}
