import React from "react";
import Link from "next/link";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui";
import { MdPeopleOutline } from "react-icons/md";
import { formatTimeAgo } from "@/shared/utils/date-utils";
import { JobActionMenu } from "./JobActionMenu";

interface EmployerJobTableRowProps {
  job: JobWithStatsDto;
  onSelect: (job: JobWithStatsDto) => void;
}

const getStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "DRAFT":
      return "bg-muted text-muted-foreground border-border/60";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

export const EmployerJobTableRow: React.FC<EmployerJobTableRowProps> = ({
  job,
  onSelect,
}) => {
  return (
    <tr className="hover:bg-row-hover transition-colors group">
      {/* Job Title & Machine */}
      <td className="px-5 py-3.5 align-middle">
        <button
          onClick={() => onSelect(job)}
          className="font-medium text-foreground hover:text-primary transition-colors text-[15px] text-left cursor-pointer"
        >
          {job.title}
        </button>
        <div className="text-muted-foreground text-xs mt-0.5">
          {job.machineNameEn || "General Machine"}
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-5 py-3.5 align-middle">
        <span
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border tracking-wide ${getStatusBadgeStyle(
            job.status,
          )}`}
        >
          {job.status}
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
      <td
        className="px-5 py-3.5 align-middle text-muted-foreground text-sm whitespace-nowrap"
        title={new Date(job.createdAt).toLocaleString()}
      >
        {formatTimeAgo(job.createdAt)}
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
