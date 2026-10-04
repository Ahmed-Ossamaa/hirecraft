import React, { useState, useRef, useEffect } from "react";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui";
import { MdMoreVert } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUpdateJob, getGetCompanyJobsQueryKey } from "@/shared/api/generated/jobs/jobs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customAxiosInstance } from "@/shared/api/axios-instance";
import { toast } from "sonner";
import { useConfirm } from "@/shared/providers/confirm-provider";

interface JobActionMenuProps {
  job: JobWithStatsDto;
}

export function JobActionMenu({ job }: JobActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const updateMutation = useUpdateJob();
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      customAxiosInstance({
        url: `/api/v1/jobs/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setOpen(!open);
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateMutation.mutateAsync({
        id: job.id,
        data: { status: status as any },
      });
      toast.success(`Job marked as ${status}`);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
    } catch (error) {
      toast.error("Failed to update status");
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
      deleteMutation.mutate(job.id);
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        onClick={handleToggle}
      >
        <MdMoreVert className="text-xl" />
      </Button>
      {open && (
        <div
          className={`absolute right-0 z-50 w-48 rounded-lg bg-card shadow-lg ring-1 ring-slate-300 dark:ring-slate-700  border border-border/60 focus:outline-none py-1 overflow-hidden ${openUpwards ? "bottom-full mb-2" : "top-full mt-2"}`}
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
          <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Change Status
          </div>
          {job.status !== "PUBLISHED" && (
            <button
              onClick={() => handleStatusChange("PUBLISHED")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {job.status !== "CLOSED" && (
            <button
              onClick={() => handleStatusChange("CLOSED")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-card-hover transition-colors disabled:opacity-50"
            >
              Close
            </button>
          )}
          {job.status !== "DRAFT" && (
            <button
              onClick={() => handleStatusChange("DRAFT")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-card-hover transition-colors disabled:opacity-50"
            >
              Move to Draft
            </button>
          )}
          <div className="border-t border-border/40 my-1"></div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      )}
    </div>
  );
}
