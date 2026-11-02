"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiError } from "@/shared/utils/error";
import { useUpdateUserBanStatus } from "@/shared/api/generated/admin-manage-users/admin-manage-users";
import {
  useAdminUpdateJobStatus as useOrvalUpdateJobStatus,
  useDeleteJob as useOrvalDeleteJob,
} from "@/shared/api/generated/admin-jobs/admin-jobs";
import type {
  UpdateUserStatusDto,
  UpdateJobStatusDto,
} from "@/shared/api/generated/model";

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const banUserMutation = useUpdateUserBanStatus({
    mutation: {
      onSuccess: (_, variables) => {
        const action = variables.data.isBanned ? "banned" : "unbanned";
        toast.success(`User successfully ${action}`);
        queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/users"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/v1/admin/analytics/overview"],
        });
      },
      onError: (err) => {
        toast.error(getApiError(err, "Failed to update user ban status"));
      },
    },
  });

  const updateJobStatusMutation = useOrvalUpdateJobStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Job status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/jobs"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/v1/admin/analytics/overview"],
        });
      },
      onError: (err) => {
        toast.error(getApiError(err, "Failed to update job status"));
      },
    },
  });

  const deleteJobMutation = useOrvalDeleteJob({
    mutation: {
      onSuccess: () => {
        toast.success("Job deleted permanently");
        queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/jobs"] });
        queryClient.invalidateQueries({
          queryKey: ["/api/v1/admin/analytics/overview"],
        });
      },
      onError: (err) => {
        toast.error(getApiError(err, "Failed to delete job"));
      },
    },
  });

  return {
    banUser: (id: string, data: UpdateUserStatusDto) =>
      banUserMutation.mutateAsync({ id, data }),
    isBanningUser: banUserMutation.isPending,

    updateJobStatus: (id: string, data: UpdateJobStatusDto) =>
      updateJobStatusMutation.mutateAsync({ id, data }),
    isUpdatingJobStatus: updateJobStatusMutation.isPending,

    deleteJob: (id: string) => deleteJobMutation.mutateAsync({ id }),
    isDeletingJob: deleteJobMutation.isPending,
  };
}

