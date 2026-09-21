import React from "react";
import {
  MdAdjust,
  MdSettingsSuggest,
  MdSmartToy,
  MdWhatshot,
  MdStraighten,
  MdConstruction,
  MdTune,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";

export type Job = {
  id: string;
  category: string;
  rate: number;
  company: string;
  location: string;
  experience: string;
  title: string;
  machine: string;
  tags: string[];
  salaryRange: string;
  salarySuffix?: string;
  icon: string;
};

const IconMap: Record<string, React.ElementType> = {
  adjust: MdAdjust,
  settings_suggest: MdSettingsSuggest,
  smart_toy: MdSmartToy,
  mode_heat: MdWhatshot,
  straighten: MdStraighten,
  construction: MdConstruction,
};

interface JobCardProps {
  job: Job;
}
//will be refactored (just implementing the styles)
export function JobCard({ job }: JobCardProps) {
  const Icon = IconMap[job.icon] || MdAdjust;

  return (
    <div className="group flex flex-col justify-between rounded-lg bg-card p-space-lg border border-border hover:border-primary/60 hover:shadow-xl hover:shadow-sky-950/40 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-space-xs pb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-card-hover border border-border text-primary">
              <Icon className="text-[24px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-technical text-label-technical text-foreground font-semibold">
                {job.company}
              </span>
              <span className="font-body-sm text-body-sm text-muted-foreground">
                {job.location}
              </span>
            </div>
          </div>
          <span className="rounded bg-sky-100 border dark:bg-sky-900/60 border-sky-800/50 px-space-xs py-space-2xs font-label-spec text-label-spec text-primary uppercase font-semibold">
            {job.experience}
          </span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-foreground group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <div className="mt-space-sm rounded bg-input border border-border/70 p-space-xs flex items-center gap-space-xs">
          <MdTune className="text-primary text-[18px]" />
          <span className="font-label-technical text-label-technical text-muted-foreground">
            {job.machine}
          </span>
        </div>
        <div className="mt-space-md flex flex-wrap gap-space-2xs">
          {job.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded bg-card-hover border border-border px-space-xs py-space-2xs font-label-spec text-label-spec text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-space-xl flex items-center justify-between border-t border-border/70 pt-space-md">
        <div>
          <p className="font-label-spec text-label-spec uppercase text-muted-foreground">
            Compensation Range
          </p>
          <p className="font-headline-sm text-headline-sm text-foreground font-medium">
            {job.salaryRange}{" "}
            {job.salarySuffix ? (
              <span className="text-body-sm text-muted-foreground">
                {job.salarySuffix}
              </span>
            ) : (
              <span className="text-body-sm text-muted-foreground">
                (${job.rate}/hr)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          className="hover:bg-linear-to-r hover:from-sky-600 hover:to-blue-600 hover:border-transparent hover:text-white uppercase tracking-wider font-semibold"
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
