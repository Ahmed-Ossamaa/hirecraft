import React from "react";
import Link from "next/link";
import { Job } from "@/shared/api/generated/model";
import { MdWorkOutline, MdLocationOn } from "react-icons/md";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";

interface PublicJobCardProps {
  job: Job;
}

export const PublicJobCard: React.FC<PublicJobCardProps> = ({ job }) => {
  return (
    <Link
      href={`/jobs?${job.id}`}
      className="block bg-card rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all p-5"
    >
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MdWorkOutline className="text-primary/70" /> {job.jobType}
            </span>
            <span className="flex items-center gap-1.5">
              <MdLocationOn className="text-primary/70" /> {job.city},{" "}
              {job.country}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-sm font-medium text-foreground bg-secondary/10 text-secondary px-3 py-1.5 rounded-full">
          {formatTimeAgo(job.createdAt)}
        </div>
      </div>
    </Link>
  );
};
