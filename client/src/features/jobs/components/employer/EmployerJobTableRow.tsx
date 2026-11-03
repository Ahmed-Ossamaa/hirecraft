import React from "react";
import Link from "next/link";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui/Button";
import { JobStatusBadge } from "@/shared/components/ui/JobStatusBadge";
import { MdOpenInNew, MdPeopleOutline } from "react-icons/md";
import {
  formatTimeAgo,
  formatDateTimeTooltip,
  getIsoString,
} from "@/shared/utils/date-utils";
import { JobActionMenu } from "./JobActionMenu";

interface EmployerJobTableRowProps {
  job: JobWithStatsDto;
  onSelect: (job: JobWithStatsDto) => void;
}

export const EmployerJobTableRow: React.FC<EmployerJobTableRowProps> = ({
  job,
  onSelect,
}) => {
  return (
    <tr className="hover:bg-row-hover transition-colors group">
      {/* Job Title & Machine */}
      <td className="px-5 py-3.5 align-middle ">
        <button
          onClick={() => onSelect(job)}
          className="font-medium text-foreground hover:text-primary transition-colors text-[15px] text-left inline-flex items-center gap-1 group max-w-60 sm:max-w-70 cursor-pointer"
          title={job.title}
        >
          <span className="truncate">{job.title}</span>
          <MdOpenInNew className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
        <div className="text-muted-foreground text-xs mt-0.5">
          {job.machineNameEn || "General Machine"}
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-5 py-3.5 align-middle">
        <span
          className="cursor-help"
          title={`First publish: ${job.publishedAt ? formatDateTimeTooltip(job.publishedAt) : "Not published"}`}
          suppressHydrationWarning
        >
          <JobStatusBadge status={job.status} />
        </span>
      </td>

      {/* Type & Experience */}
      <td className="px-5 py-3.5 align-middle text-sm text-foreground">
        <div className="text-foreground">{job.jobType}</div>
        <div className="text-muted-foreground text-xs mt-0.5">
          {job.experienceLevel}
        </div>
      </td>

      {/* Applicants Count */}
      <td className="px-5 py-3.5 align-middle text-center">
        <Link
          href={`/dashboard/company/jobs/${job.id}/applicants`}
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
        >
          <span className="text-base">{job.applicationCount || 0}</span>
        </Link>
      </td>

      {/* Posted Date */}
      <td className="px-5 py-3.5 align-middle text-muted-foreground text-sm whitespace-nowrap">
        <time
          dateTime={getIsoString(job.createdAt)}
          className="cursor-help"
          title={formatDateTimeTooltip(job.createdAt)}
          suppressHydrationWarning
        >
          {formatTimeAgo(job.createdAt)}
        </time>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 align-middle text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/company/jobs/${job.id}/applicants`}>
            <Button
              size="sm"
              leftIcon={<MdPeopleOutline className="text-xs" />}
            >
              Applicants
            </Button>
          </Link>
          <JobActionMenu job={job} />
        </div>
      </td>
    </tr>
  );
};
