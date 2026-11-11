"use client";

import React, { useState, useRef, useEffect } from "react";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui/Button";
import { MdMoreVert } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUpdateJobStatus, useDeleteJob } from "@/features/jobs/api/useJobMutations";
import { toast } from "sonner";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { getApiError } from "@/shared/utils/error";

interface JobActionMenuProps {
  job: JobWithStatsDto;
}

export function JobActionMenu({ job }: JobActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const { confirm } = useConfirm();
  const updateStatusMutation = useUpdateJobStatus();
  const deleteMutation = useDeleteJob();

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
      setOpenUpwards(opensUp);
      
      setDropdownStyle({
        position: 'fixed',
        top: opensUp ? undefined : rect.bottom + 8,
        bottom: opensUp ? window.innerHeight - rect.top + 8 : undefined,
        left: rect.right - 192,
        width: 192,
        zIndex: 9999,
      });
    }
    setOpen(!open);
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: job.id,
        data: { status: status as any },
      });
      toast.success(
        status === "PUBLISHED"
          ? "Job published successfully!"
          : `Job moved to ${status.toLowerCase()}`,
      );
      setOpen(false);
    } catch (error) {
      toast.error(getApiError(error, "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Job",
      message: "Are you sure you want to delete this job? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (isConfirmed) {
      deleteMutation.mutate(job.id, {
        onSuccess: () => {
          toast.success("Job deleted successfully");
          setOpen(false);
        },
        onError: (err) => {
          toast.error(getApiError(err, "Failed to delete job"));
        }
      });
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="action menu"
        title="Action Menu"
        className="h-8 w-8 p-0 text-muted-foreground hover:bg-card/60 hover:text-foreground"
        onClick={handleToggle}
      >
        <MdMoreVert className="text-xl" />
      </Button>
      {open && (
        <div
          style={dropdownStyle}
          className={`rounded-lg bg-card shadow-lg ring-1 ring-slate-300 dark:ring-slate-700 border border-border/60 py-1 overflow-hidden`}
        >
          <Link
            href={`/dashboard/company/jobs/${job.id}/edit`}
            className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover transition-colors"
          >
            Edit Job
          </Link>
          <Link
            href={`/jobs?jobId=${job.id}`}
            className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover transition-colors"
          >
            View Public Job
          </Link>
          <div className="border-t border-border/40 my-1"></div>
          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Change Status
          </div>
          {job.status !== "PUBLISHED" && (
            <button
              onClick={() => handleStatusChange("PUBLISHED")}
              disabled={updateStatusMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {job.status !== "DRAFT" && (
            <button
              onClick={() => handleStatusChange("DRAFT")}
              disabled={updateStatusMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-card-hover transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Move to Draft
            </button>
          )}
          <div className="border-t border-border/40 my-1"></div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="block w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      )}
    </div>
  );
}
