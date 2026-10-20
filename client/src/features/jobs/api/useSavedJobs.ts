"use client";

import React, { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetSavedJobs,
  useSaveJob as useOrvalSaveJob,
  useUnsaveJob as useOrvalUnsaveJob,
  getGetSavedJobsQueryKey,
} from "@/shared/api/generated/saved-jobs/saved-jobs";
import { useAuthStore } from "@/shared/stores/auth-store";
import type {
  GetSavedJobsParams,
  Job,
  SavedJobResponseDto,
} from "@/shared/api/generated/model";

export const useSavedJobs = (params?: GetSavedJobsParams) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useGetSavedJobs(params, {
    query: {
      enabled: isAuthenticated,
    },
  });

  const savedJobs: SavedJobResponseDto[] = useMemo(() => {
    return query.data?.data?.data || [];
  }, [query.data]);

  const total = query.data?.data?.total || 0;
  const page = query.data?.data?.page || 1;
  const totalPages = query.data?.data?.totalPages || 1;

  const savedJobIdSet = useMemo(() => {
    return new Set(savedJobs.map((item) => item.jobId));
  }, [savedJobs]);

  const isJobSaved = useCallback(
    (jobId?: string) => {
      if (!jobId) return false;
      return savedJobIdSet.has(jobId);
    },
    [savedJobIdSet]
  );

  return {
    ...query,
    savedJobs,
    total,
    page,
    totalPages,
    isJobSaved,
  };
};

export const useToggleSaveJob = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const saveMutation = useOrvalSaveJob();
  const unsaveMutation = useOrvalUnsaveJob();

  const isPending = saveMutation.isPending || unsaveMutation.isPending;

  const unsaveJob = useCallback(
    async (jobId: string) => {
      if (!isAuthenticated) {
        toast.error("Please log in to manage saved jobs");
        router.push("/auth");
        return;
      }

      const queryKey = getGetSavedJobsQueryKey();
      await queryClient.cancelQueries({ queryKey });

      const previousSavedQueries = queryClient.getQueriesData({ queryKey });

      // Optimistic Unsave across cached queries
      queryClient.setQueriesData({ queryKey }, (old: any) => {
        if (!old) return old;
        if (old.data?.data && Array.isArray(old.data.data)) {
          const nextList = old.data.data.filter(
            (item: SavedJobResponseDto) => item.jobId !== jobId
          );
          const nextTotal = Math.max(0, (old.data.total ?? old.data.data.length) - 1);
          const limit = old.data.limit || 10;
          return {
            ...old,
            data: {
              ...old.data,
              data: nextList,
              total: nextTotal,
              totalPages: Math.max(1, Math.ceil(nextTotal / limit)),
            },
          };
        }
        if (Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter(
              (item: SavedJobResponseDto) => item.jobId !== jobId
            ),
            total: Math.max(0, (old.total ?? old.data.length) - 1),
          };
        }
        if (Array.isArray(old)) {
          return old.filter((item: SavedJobResponseDto) => item.jobId !== jobId);
        }
        return old;
      });

      unsaveMutation.mutate(
        { jobId },
        {
          onSuccess: () => {
            toast.success("Job removed from saved");
            queryClient.invalidateQueries({ queryKey });
          },
          onError: (err: any) => {
            previousSavedQueries.forEach(([key, oldData]) => {
              queryClient.setQueryData(key, oldData);
            });
            const msg = err?.response?.data?.message || "Failed to remove saved job";
            toast.error(msg);
          },
        }
      );
    },
    [isAuthenticated, queryClient, router, unsaveMutation]
  );

  const toggleSave = useCallback(
    async (job: Job, currentlySaved: boolean) => {
      if (!isAuthenticated) {
        toast.error("Please log in to save jobs");
        router.push("/auth");
        return;
      }

      if (currentlySaved) {
        return unsaveJob(job.id);
      }

      const queryKey = getGetSavedJobsQueryKey();
      await queryClient.cancelQueries({ queryKey });

      const previousSavedQueries = queryClient.getQueriesData({ queryKey });

      // Optimistic Save across cached queries
      const optimisticEntry: SavedJobResponseDto = {
        id: `temp-${Date.now()}`,
        userId: user?.id || "",
        jobId: job.id,
        createdAt: new Date().toISOString(),
        job,
      };

      queryClient.setQueriesData({ queryKey }, (old: any) => {
        if (!old?.data) return old;
        const prevList = old.data.data || [];
        return {
          ...old,
          data: {
            ...old.data,
            data: [optimisticEntry, ...prevList],
            total: (old.data.total || 0) + 1,
          },
        };
      });

      saveMutation.mutate(
        { jobId: job.id },
        {
          onSuccess: () => {
            toast.success("Job saved for later");
            queryClient.invalidateQueries({ queryKey });
          },
          onError: (err: any) => {
            previousSavedQueries.forEach(([key, oldData]) => {
              queryClient.setQueryData(key, oldData);
            });
            const msg =
              err?.response?.data?.message || "Failed to save job";
            toast.error(msg);
          },
        }
      );
    },
    [isAuthenticated, user, queryClient, router, saveMutation, unsaveJob]
  );

  return {
    toggleSave,
    unsaveJob,
    isPending,
  };
};
