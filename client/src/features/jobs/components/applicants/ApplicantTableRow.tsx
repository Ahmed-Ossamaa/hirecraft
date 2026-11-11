import React from "react";
import type {
  EmployerApplicationResponseDto,
  EmployerApplicationResponseDtoStatus,
} from "@/shared/api/generated/model";
import { formatTimeAgo } from "@/shared/utils/date-utils";
import { MdStar, MdStarBorder, MdArchive, MdUnarchive } from "react-icons/md";
import Image from "next/image";

import {
  getApplicationStatusColor,
  EMPLOYER_APPLICATION_STATUS_OPTIONS,
} from "@/shared/utils/applicationStatus";

import { FiFileText } from "react-icons/fi";

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

interface ApplicantTableRowProps {
  application: EmployerApplicationResponseDto;
  onSelectApplicant: (application: EmployerApplicationResponseDto) => void;
  onViewCoverLetter: (application: EmployerApplicationResponseDto) => void;
  onToggleStar: (applicationId: string, isStarred: boolean) => void;
  onStatusChange: (
    applicationId: string,
    newStatus: EmployerApplicationResponseDtoStatus,
  ) => void;
  onToggleArchive: (applicationId: string, isArchived: boolean) => void;
  isStarPending: boolean;
  isStatusPending: boolean;
  isArchivePending: boolean;
}

export const ApplicantTableRow: React.FC<ApplicantTableRowProps> = ({
  application: app,
  onSelectApplicant,
  onViewCoverLetter,
  onToggleStar,
  onStatusChange,
  onToggleArchive,
  isStarPending,
  isStatusPending,
  isArchivePending,
}) => {
  return (
    <tr className="hover:bg-row-hover transition-colors">
      {/* Column 1: Applicant (Clickable to open profile) */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          {/* Star Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(app.id, !app.isStarred);
            }}
            disabled={isStarPending}
            aria-busy={isStarPending}
            className="text-lg transition-transform hover:scale-110 cursor-pointer p-1 text-muted-foreground hover:text-amber-400 focus:outline-none shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              isStarPending
                ? "Updating applicant star"
                : app.isStarred
                  ? "Starred candidate"
                  : "Star candidate"
            }
            aria-label={
              isStarPending
                ? "Updating applicant star"
                : app.isStarred
                  ? "Unstar applicant"
                  : "Star applicant"
            }
          >
            {app.isStarred ? (
              <MdStar className="text-amber-400" />
            ) : (
              <MdStarBorder className="text-muted-foreground/50 hover:text-amber-400" />
            )}
          </button>

          {/* Candidate Info (Opens SlideOver) */}
          <div
            onClick={() => onSelectApplicant(app)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
            title="Click to view candidate profile"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0 overflow-hidden">
              {app.applicantAvatar ? (
                <Image
                  src={app.applicantAvatar}
                  alt={app.applicantName || "Candidate"}
                  className="object-cover"
                  width={36}
                  height={36}
                />
              ) : (
                <span>{getInitials(app.applicantName)}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {app.applicantName || "Unknown Candidate"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {app.workerTitle || "Candidate"}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Column 2: Cover Letter Preview */}
      <td className="px-5 py-3.5 max-w-55">
        {app.coverLetter ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewCoverLetter(app);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer group text-left max-w-full"
            title="Click to view full cover letter"
          >
            <FiFileText className="text-primary shrink-0 text-sm group-hover:scale-110 transition-transform" />
            <span className="truncate group-hover:underline">
              {app.coverLetter}
            </span>
          </button>
        ) : (
          <span className="text-muted-foreground/40 text-xs select-none">
            —
          </span>
        )}
      </td>

      {/* Column 3: Applied At */}
      <td
        className="px-5 py-3.5 text-muted-foreground whitespace-nowrap cursor-help"
        title={new Date(app.createdAt).toLocaleString()}
      >
        {formatTimeAgo(app.createdAt)}
      </td>

      {/* Column 4: Status */}
      <td className="px-5 py-3.5">
        <select
          value={app.status}
          disabled={isStatusPending}
          aria-busy={isStatusPending}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            onStatusChange(
              app.id,
              e.target.value as EmployerApplicationResponseDtoStatus,
            )
          }
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${getApplicationStatusColor(
            app.status,
          )}`}
        >
          {EMPLOYER_APPLICATION_STATUS_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-card text-foreground"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </td>

      {/* Column 5: Actions (Archive / Unarchive) */}
      <td className="px-5 py-3.5 text-right pr-6">
        {app.isArchived ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(app.id, false);
            }}
            disabled={isArchivePending}
            aria-busy={isArchivePending}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            title={isArchivePending ? "Updating archive status" : "Restore to active pipeline"}
          >
            <MdUnarchive className="text-sm" /> {isArchivePending ? "Updating..." : "Unarchive"}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(app.id, true);
            }}
            disabled={isArchivePending}
            aria-busy={isArchivePending}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border/60 hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            title={isArchivePending ? "Updating archive status" : "Archive application"}
          >
            <MdArchive className="text-sm" /> {isArchivePending ? "Updating..." : "Archive"}
          </button>
        )}
      </td>
    </tr>
  );
};
