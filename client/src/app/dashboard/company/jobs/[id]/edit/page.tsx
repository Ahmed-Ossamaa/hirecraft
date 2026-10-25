"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetJobById } from "@/shared/api/generated/jobs/jobs";
import { JobForm } from "@/features/jobs/components/employer/JobForm";
import { EditJobSkeleton } from "@/features/jobs/components/employer/EditJobSkeleton";
import { MdEdit, MdArrowBack, MdErrorOutline } from "react-icons/md";
import { Button } from "@/shared/components/ui";

function EditJobError({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-card p-12 rounded-2xl border border-border shadow-sm text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center text-2xl">
        <MdErrorOutline />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Job Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          The job posting you are trying to edit could not be found or you do not have permission to modify it.
        </p>
      </div>
      <Button variant="outline" onClick={onBack} leftIcon={<MdArrowBack />}>
        Back to Jobs
      </Button>
    </div>
  );
}

export default function EditJobPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: jobRes, isLoading, isError } = useGetJobById(id);
  const job = jobRes?.data;

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MdEdit className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
              Edit Job
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update the details and requirements for this job posting.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/company/jobs")}
          leftIcon={<MdArrowBack />}
        >
          Back to Jobs
        </Button>
      </div>

      {isLoading ? (
        <EditJobSkeleton />
      ) : isError || !job ? (
        <EditJobError onBack={() => router.push("/dashboard/company/jobs")} />
      ) : (
        <JobForm key={job.id} initialJob={job} />
      )}
    </div>
  );
}
