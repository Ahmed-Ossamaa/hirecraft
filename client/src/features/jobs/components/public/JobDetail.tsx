"use client";

import React, { useState } from "react";
import {
  MdLocationOn,
  MdPrecisionManufacturing,
  MdAttachMoney,
  MdWorkOutline,
  MdAccessTime,
  MdArrowForward,
  MdWorkspacePremium,
  MdBookmark,
  MdBookmarkBorder,
  MdPeopleOutline,
  MdEdit,
  MdTimelapse,
} from "react-icons/md";
import { Button } from "@/shared/components/ui";
import { Job, UserUserType } from "@/shared/api/generated/model";
import { ApplyModal } from "@/features/applications/components/ApplyModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useSavedJobs, useToggleSaveJob } from "@/features/jobs/api/useSavedJobs";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";

interface JobDetailProps {
  job: Job | null;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job }) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const organizationId = useAuthStore((s) => s.organizationId);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { isJobSaved } = useSavedJobs();
  const { toggleSave, isPending } = useToggleSaveJob();

  const isEmployer = user?.userType === UserUserType.EMPLOYER;
  const isOwner = Boolean(
    isEmployer && organizationId && job && organizationId === job.companyId,
  );

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to apply for this job");
      router.push("/auth");
      return;
    }
    setIsApplyModalOpen(true);
  };
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-2xl border border-border">
        <MdWorkOutline className="text-6xl text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-headline text-2xl text-foreground mb-2">
          No Job Selected
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Select a job from the list to view its full details, machine
          requirements, and apply.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-border bg-card-hover/50 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl text-foreground tracking-tight mb-2">
              {job.title}
            </h2>
            <div className="flex items-center text-muted-foreground font-medium mb-4">
              <Link href={`/company/${job.companyId}`}>
                <span className="text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors ">
                  {job.companyName}
                </span>
              </Link>
              <span className="mx-2">•</span>
              <span className="flex items-center gap-1">
                <MdLocationOn />
                {job.city}, {job.country}
              </span>
              <span className="mx-2">•</span>
              <span className="flex items-center gap-1 text-xs">
                <MdTimelapse />
                {formatTimeAgo(job.createdAt.toString())}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-input border border-border text-xs font-mono text-foreground uppercase">
                <MdWorkOutline className="text-primary text-sm" />
                {job.jobType}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-input border border-border text-xs font-mono text-foreground uppercase">
                <MdAccessTime className="text-primary text-sm" />
                {job.experienceLevel}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-input border border-border text-xs font-mono text-foreground uppercase">
                <MdWorkspacePremium className="text-primary text-sm" />
                {job.yearsOfExperience}+ Yrs Exp
              </span>
              {job.salaryRange && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                  <MdAttachMoney className="text-sm text-emerald-600 dark:text-emerald-400" />
                  {job.salaryRange}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-3 min-w-40">
            {isOwner ? (
              <>
                <Link
                  href={`/dashboard/company/jobs/${job.id}/applicants`}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    leftIcon={<MdPeopleOutline className="text-lg" />}
                  >
                    View Applicants
                  </Button>
                </Link>

                <Link
                  href={`/dashboard/company/jobs/${job.id}/edit`}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    leftIcon={<MdEdit className="text-base" />}
                  >
                    Edit Job
                  </Button>
                </Link>
              </>
            ) : isEmployer ? (
              <div className="px-2 py-2.5 rounded-xl bg-gray-200 dark:bg-input/60 border border-border text-xs text-foreground dark:text-muted-foreground text-center font-medium">
                Company View
              </div>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  rightIcon={<MdArrowForward />}
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>
                <Button
                  variant={isJobSaved(job.id) ? "secondary" : "outline"}
                  size="md"
                  fullWidth
                  leftIcon={
                    isJobSaved(job.id) ? (
                      <MdBookmark className="text-base text-primary" />
                    ) : (
                      <MdBookmarkBorder className="text-base" />
                    )
                  }
                  onClick={() => toggleSave(job, isJobSaved(job.id))}
                  disabled={isPending}
                  title={
                    isJobSaved(job.id)
                      ? "Remove from saved jobs"
                      : "Save job for later"
                  }
                  className={
                    isJobSaved(job.id)
                      ? "border-primary/40 text-foreground hover:border-primary"
                      : ""
                  }
                >
                  {isJobSaved(job.id) ? "Saved" : "Save for later"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-8">
          {/* Role Description */}
          <section>
            <h3 className="font-label-technical text-sm text-foreground uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Role Description
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description || "No detailed description provided."}
            </div>
          </section>

          {/* Target Machinery Specification */}
          {job.machineNameEn && (
            <section>
              <h3 className="font-label-technical text-sm text-foreground uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Target Machinery
              </h3>
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-card-hover border border-border">
                <div className="w-8 h-8 rounded-lg bg-input flex items-center justify-center text-primary">
                  <MdPrecisionManufacturing className="text-lg" />
                </div>
                <span className="text-sm font-semibold text-foreground tracking-wide">
                  {job.machineNameEn}
                </span>
              </div>
            </section>
          )}
          {/*Job Requirements */}
          <section>
            <h3 className="font-label-technical text-sm text-foreground uppercase tracking-widest font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Requirements & Qualifications
            </h3>
            {/* requirements */}
            {job.requirements && job.requirements.length > 0 ? (
              <ul className="space-y-2.5">
                {job.requirements.map((req: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No specific requirements listed.
              </p>
            )}
          </section>
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.companyName || ""}
      />
    </div>
  );
};
