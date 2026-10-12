import { MdSettingsSuggest, MdTune } from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";
import { Job } from "@/shared/api/generated/model/job";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const Icon = MdSettingsSuggest;

  return (
    <div className="group flex flex-col justify-between rounded-xl bg-card p-space-lg border border-border/80 shadow-md shadow-slate-200/50 dark:shadow-none hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-sky-950/40 transition-all duration-300">
      <div>
        <div className="flex items-start justify-between gap-space-xs pb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-card-hover border border-primary/10 dark:border-border text-primary">
              <Icon className="text-[24px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-technical text-label-technical text-foreground font-semibold">
                {job.companyName}
              </span>
              <span className="font-body-sm text-body-sm text-muted-foreground">
                {job.city}, {job.country}
              </span>
            </div>
          </div>
          <span className="rounded bg-sky-100 border dark:bg-sky-900/60 border-sky-800/50 px-space-xs py-space-2xs font-label-spec text-label-spec text-primary uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-28">
            {job.experienceLevel}
          </span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-foreground line-clamp-2">
          {job.title}
        </h3>
        {job.machineNameEn && (
          <div className="mt-space-sm rounded bg-input border border-border/70 p-space-xs flex items-center gap-space-xs">
            <MdTune className="text-primary text-[18px]" />
            <span className="font-label-technical text-label-technical text-muted-foreground line-clamp-1">
              {job.machineNameEn}
            </span>
          </div>
        )}
      </div>
      <div className="mt-space-xl flex items-center justify-between border-t border-border/70 pt-space-md gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-label-spec text-label-spec uppercase text-muted-foreground truncate">
            Salary Range
          </p>
          {job.salaryRange ? (
            <p className="font-headline-sm text-headline-sm text-foreground font-medium truncate">
              {job.salaryRange}
            </p>
          ) : (
            <p className="text-muted-foreground">Confidential</p>
          )}
        </div>
        <Link href={`/jobs?jobId=${job.id}`}>
          <Button
            variant="secondary"
            className="hover:bg-linear-to-r hover:from-sky-600 hover:to-blue-600 hover:border-transparent hover:text-white  font-semibold whitespace-nowrap"
          >
            View Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
