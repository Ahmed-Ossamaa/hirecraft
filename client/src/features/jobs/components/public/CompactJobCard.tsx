import React from "react";
import {
  MdLocationOn,
  MdPrecisionManufacturing,
  MdAttachMoney,
} from "react-icons/md";
import { Job } from "@/shared/api/generated/model";
import { formatTimeAgo } from "@/shared/utils/date-utils";

interface CompactJobCardProps {
  job: Job;
  isActive: boolean;
  onClick: () => void;
}

export const CompactJobCard: React.FC<CompactJobCardProps> = ({
  job,
  isActive,
  onClick,
}) => {
  const postedAgo = formatTimeAgo(job.createdAt);

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer rounded-xl border transition-all duration-200 ${
        isActive
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-card border-border hover:border-primary/60 hover:bg-card-hover/40 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3
          className={`font-headline text-base md:text-lg tracking-tight leading-tight ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {job.title}
          {job.machineNameEn && (
            <span className="text-sm font-normal text-muted-foreground ml-1.5 font-sans">
              - {job.machineNameEn}
            </span>
          )}
        </h3>
        {postedAgo && (
          <span className="text-[11px] font-mono text-muted-foreground/80 shrink-0 mt-0.5">
            {postedAgo}
          </span>
        )}
      </div>

      <div className="flex items-center text-xs md:text-sm text-muted-foreground mb-3 font-medium flex-wrap gap-y-1">
        <span>{job.companyName || "Unknown Company"}</span>
        <span className="mx-2">•</span>
        <span className="flex items-center gap-1">
          <MdLocationOn className="shrink-0" />
          {job.city}, {job.country}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.machineNameEn && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-card-hover border border-border text-[11px] font-mono text-foreground uppercase">
            <MdPrecisionManufacturing className="text-primary" />
            {job.machineNameEn}
          </span>
        )}

        {job.salaryRange && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
            <MdAttachMoney className="text-xs text-emerald-600 dark:text-emerald-400" />
            {job.salaryRange}
          </span>
        )}
      </div>
    </div>
  );
};
