'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiError } from '@/shared/utils/error';
import {
  getGetUsersQueryKey,
  useUpdateUserBanStatus,
} from '@/shared/api/generated/admin-manage-users/admin-manage-users';
import {
  useAdminUpdateJobStatus as useOrvalUpdateJobStatus,
  useDeleteJob as useOrvalDeleteJob,
  getGetAdminJobsQueryKey,
} from '@/shared/api/generated/admin-jobs/admin-jobs';
import type {
  UpdateUserStatusDto,
  UpdateJobStatusDto,
} from '@/shared/api/generated/model';
import { getGetOverviewStatsQueryKey } from '@/shared/api/generated/admin-analytics/admin-analytics';

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetUsersQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetOverviewStatsQueryKey(),
      }),
    ]);

  const invalidateJobs = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetAdminJobsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetOverviewStatsQueryKey(),
      }),
    ]);

  const handleError = (error: unknown, message: string) => {
    toast.error(getApiError(error, message));
  };

  const banUserMutation = useUpdateUserBanStatus({
    mutation: {
      onSuccess: async (_, variables) => {
        const action = variables.data.isBanned ? 'banned' : 'unbanned';
        toast.success(`User successfully ${action}`);
        await invalidateUsers();
      },
      onError: (error) =>
        handleError(error, 'Failed to update user ban status'),
    },
  });

  const updateJobStatusMutation = useOrvalUpdateJobStatus({
    mutation: {
      onSuccess: async () => {
        toast.success('Job status updated successfully');
        await invalidateJobs();
      },
      onError: (error) => handleError(error, 'Failed to update job status'),
    },
  });

  const deleteJobMutation = useOrvalDeleteJob({
    mutation: {
      onSuccess: async () => {
        toast.success('Job deleted permanently');
        await invalidateJobs();
      },
      onError: (error) => handleError(error, 'Failed to delete job'),
    },
  });

  return {
    banUser: (
      id: string,
      data: UpdateUserStatusDto,
      onSuccess?: () => void,
    ) =>
      banUserMutation.mutate({ id, data }, { onSuccess }),
    isBanningUser: banUserMutation.isPending,

    updateJobStatus: (id: string, data: UpdateJobStatusDto) =>
      updateJobStatusMutation.mutate({ id, data }),
    isUpdatingJobStatus: updateJobStatusMutation.isPending,

    deleteJob: (id: string) => deleteJobMutation.mutate({ id }),
    isDeletingJob: deleteJobMutation.isPending,
  };
}
