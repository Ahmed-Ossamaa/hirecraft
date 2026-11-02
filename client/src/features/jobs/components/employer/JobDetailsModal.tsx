import React from "react";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import {
  MdClose,
  MdWork,
  MdLocationOn,
  MdDateRange,
  MdCalendarToday,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";
import {
  formatDate,
  formatDateTimeTooltip,
  getIsoString,
} from "@/shared/utils/date-utils";

interface JobDetailsModalProps {
  job: JobWithStatsDto;
  onClose: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="text-lg font-semibold text-foreground">Job Details</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MdWork className="text-primary" />
                {job.jobType}
              </span>
              {(job.city || job.country) && (
                <span className="flex items-center gap-1.5">
                  <MdLocationOn className="text-primary" />
                  {job.city}
                  {job.city && job.country ? ", " : ""}
                  {job.country}
                </span>
              )}
              <time
                dateTime={getIsoString(job.createdAt)}
                className="flex items-center gap-1.5"
                title={formatDateTimeTooltip(job.createdAt)}
              >
                <MdDateRange className="text-primary" />
                Created {formatDate(job.createdAt)}
              </time>
              {job.publishedAt && (
                <time
                  dateTime={getIsoString(job.publishedAt)}
                  className="flex items-center gap-1.5"
                  title={formatDateTimeTooltip(job.publishedAt)}
                >
                  <MdCalendarToday className="text-emerald-600" />
                  Published {formatDate(job.publishedAt)}
                </time>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Machine
              </div>
              <div className="text-foreground">
                {job.machineNameEn || "General Machine"}
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Experience Needed
              </div>
              <div className="text-foreground">
                {job.experienceLevel} ({job.yearsOfExperience}+ years)
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border/40 pb-2">
              Description
            </h3>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-[15px]">
              {job.description}
            </div>
          </div>

          {job.requirements && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border/40 pb-2">
                Requirements
              </h3>
                <ul className="text-muted-foreground list-disc pl-5 space-y-1.5 text-[15px] leading-relaxed">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
