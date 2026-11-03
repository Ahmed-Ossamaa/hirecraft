"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Job, JobStatus } from "@/shared/api/generated/model";
import {
  MdMoreVert,
  MdCheckCircleOutline,
  MdOutlineDrafts,
  MdCancel,
  MdDeleteForever,
  MdOpenInNew,
} from "react-icons/md";

interface AdminJobActionMenuProps {
  job: Job;
  onStatusChange: (job: Job, newStatus: JobStatus) => Promise<void>;
  onDeleteJob: (job: Job) => Promise<void>;
  disabled?: boolean;
}

export function AdminJobActionMenu({
  job,
  onStatusChange,
  onDeleteJob,
  disabled = false,
}: AdminJobActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const opensUp = spaceBelow < 280 && rect.top > 280;

      setDropdownStyle({
        position: "fixed",
        top: opensUp ? undefined : rect.bottom + 6,
        bottom: opensUp ? window.innerHeight - rect.top + 6 : undefined,
        left: rect.right - 200,
        width: 200,
        zIndex: 9999,
      });
    }
    setOpen(!open);
  };

  const handleSelectStatus = async (newStatus: JobStatus) => {
    setOpen(false);
    await onStatusChange(job, newStatus);
  };

  const handleDelete = async () => {
    setOpen(false);
    await onDeleteJob(job);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Job actions"
        title="Job Actions"
        disabled={disabled}
        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        onClick={handleToggle}
      >
        <MdMoreVert className="text-lg" />
      </Button>

      {open && (
        <div
          style={dropdownStyle}
          className="rounded-xl bg-card shadow-xl ring-1 ring-border/80 border border-border py-1.5 overflow-hidden text-left animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="px-3.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Change Status
          </div>

          {job.status !== JobStatus.PUBLISHED && (
            <button
              type="button"
              onClick={() => handleSelectStatus(JobStatus.PUBLISHED)}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <MdCheckCircleOutline className="text-sm" />
              Publish Job
            </button>
          )}

          {job.status !== JobStatus.DRAFT && (
            <button
              type="button"
              onClick={() => handleSelectStatus(JobStatus.DRAFT)}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              <MdOutlineDrafts className="text-sm" />
              Move to Draft
            </button>
          )}

          {job.status !== JobStatus.CLOSED && (
            <button
              type="button"
              onClick={() => handleSelectStatus(JobStatus.CLOSED)}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <MdCancel className="text-sm" />
              Close Job
            </button>
          )}

          <div className="border-t border-border/50 my-1" />

          <Link
            href={`/jobs?jobId=${job.id}`}
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-card-hover transition-colors cursor-pointer"
          >
            <MdOpenInNew className="text-sm text-muted-foreground" />
            View Public Listing
          </Link>

          <div className="border-t border-border/50 my-1" />

          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <MdDeleteForever className="text-sm" />
            Delete Permanently
          </button>
        </div>
      )}
    </div>
  );
}

