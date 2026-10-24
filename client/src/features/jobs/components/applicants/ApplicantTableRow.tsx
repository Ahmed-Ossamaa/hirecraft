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
  onSelectApplicant: (workerProfileId: string) => void;
  onToggleStar: (applicationId: string, isStarred: boolean) => void;
  onStatusChange: (
    applicationId: string,
    newStatus: EmployerApplicationResponseDtoStatus,
  ) => void;
  onToggleArchive: (applicationId: string, isArchived: boolean) => void;
}

export const ApplicantTableRow: React.FC<ApplicantTableRowProps> = ({
  application: app,
  onSelectApplicant,
  onToggleStar,
  onStatusChange,
  onToggleArchive,
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
            className="text-lg transition-transform hover:scale-110 cursor-pointer p-1 text-muted-foreground hover:text-amber-400 focus:outline-none shrink-0"
            title={app.isStarred ? "Starred candidate" : "Star candidate"}
            aria-label={app.isStarred ? "Unstar applicant" : "Star applicant"}
          >
            {app.isStarred ? (
              <MdStar className="text-amber-400" />
            ) : (
              <MdStarBorder className="text-muted-foreground/50 hover:text-amber-400" />
            )}
          </button>

          {/* Candidate Info (Opens SlideOver) */}
          <div
            onClick={() => onSelectApplicant(app.workerProfileId)}
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

      {/* Column 2: Applied At */}
      <td
        className="px-5 py-3.5 text-muted-foreground whitespace-nowrap cursor-help"
        title={new Date(app.createdAt).toLocaleString()}
      >
        {formatTimeAgo(app.createdAt)}
      </td>

      {/* Column 3: Status */}
      <td className="px-5 py-3.5">
        <select
          value={app.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            onStatusChange(
              app.id,
              e.target.value as EmployerApplicationResponseDtoStatus,
            )
          }
          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${getApplicationStatusColor(
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

      {/* Column 4: Actions (Archive / Unarchive) */}
      <td className="px-5 py-3.5 text-right pr-6">
        {app.isArchived ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(app.id, false);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors cursor-pointer"
            title="Restore to active pipeline"
          >
            <MdUnarchive className="text-sm" /> Unarchive
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(app.id, true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-border/60 hover:bg-card-hover text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Archive application"
          >
            <MdArchive className="text-sm" /> Archive
          </button>
        )}
      </td>
    </tr>
  );
};
