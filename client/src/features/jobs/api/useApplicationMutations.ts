import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateStatus as useOrvalUpdateStatus,
  useUpdateArchiveStatus as useOrvalUpdateArchiveStatus,
  useUpdateStarredStatus as useOrvalUpdateStarredStatus,
  getGetJobApplicationStatsQueryKey,
} from "@/shared/api/generated/job-applications/job-applications";
import type {
  EmployerApplicationResponseDto,
  EmployerApplicationResponseDtoStatus,
  GetApplicationsForJobTab,
} from "@/shared/api/generated/model";
import { toast } from "sonner";

export const useUpdateApplicationStatus = (jobId: string) => {
  const queryClient = useQueryClient();

  return useOrvalUpdateStatus({
    mutation: {
      onMutate: async (variables) => {
        const queryPrefix = [`/api/v1/applications/job/${jobId}`];
        await queryClient.cancelQueries({ queryKey: queryPrefix });

        // previous applications queries for rollback
        const previousQueries = queryClient.getQueriesData({ queryKey: queryPrefix });

        // Optimistic  cache update
        queryClient.setQueriesData(
          { queryKey: queryPrefix },
          (old: any) => {
            if (!old?.data?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.map((a: EmployerApplicationResponseDto) =>
                  a.id === variables.id ? { ...a, status: variables.data.status as EmployerApplicationResponseDtoStatus } : a
                ),
              },
            };
          }
        );

        return { previousQueries };
      },
      onSuccess: () => {
        toast.success("Application status updated");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
        toast.error("Failed to update status");
      },
      onSettled: () => {
        //applications list
        queryClient.invalidateQueries({
          queryKey: [`/api/v1/applications/job/${jobId}`],
        });
        //stats
        queryClient.invalidateQueries({
          queryKey: getGetJobApplicationStatsQueryKey(jobId),
        });
      },
    },
  });
};

export const useUpdateApplicationStar = (jobId: string) => {
  const queryClient = useQueryClient();

  return useOrvalUpdateStarredStatus({
    mutation: {
      onMutate: async (variables) => {
        const queryPrefix = [`/api/v1/applications/job/${jobId}`];
        await queryClient.cancelQueries({ queryKey: queryPrefix });

        const previousQueries = queryClient.getQueriesData({ queryKey: queryPrefix });

        queryClient.setQueriesData(
          { queryKey: queryPrefix },
          (old: any) => {
            if (!old?.data?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.map((a: EmployerApplicationResponseDto) =>
                  a.id === variables.id ? { ...a, isStarred: variables.data.isStarred } : a
                ),
              },
            };
          }
        );

        return { previousQueries };
      },
      onSuccess: (_data, variables) => {
        toast.success(variables.data.isStarred ? "Applicant starred" : "Applicant unstarred");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
        toast.error("Failed to update star");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/v1/applications/job/${jobId}`],
        });
        queryClient.invalidateQueries({
          queryKey: getGetJobApplicationStatsQueryKey(jobId),
        });
      },
    },
  });
};

export const useUpdateApplicationArchive = (
  jobId: string,
  currentTab?: GetApplicationsForJobTab
) => {
  const queryClient = useQueryClient();

  return useOrvalUpdateArchiveStatus({
    mutation: {
      onMutate: async (variables) => {
        const queryPrefix = [`/api/v1/applications/job/${jobId}`];
        await queryClient.cancelQueries({ queryKey: queryPrefix });

        const previousQueries = queryClient.getQueriesData({ queryKey: queryPrefix });

        queryClient.setQueriesData(
          { queryKey: queryPrefix },
          (old: any) => {
            if (!old?.data?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data:
                  currentTab === "STARRED"
                    ? old.data.data.map((a: EmployerApplicationResponseDto) =>
                        a.id === variables.id ? { ...a, isArchived: variables.data.isArchived } : a
                      )
                    : old.data.data.filter((a: EmployerApplicationResponseDto) => a.id !== variables.id),
              },
            };
          }
        );

        return { previousQueries };
      },
      onSuccess: (_data, variables) => {
        toast.success(
          variables.data.isArchived
            ? "Applicant archived"
            : "Applicant unarchived and restored to active pipeline"
        );
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
        toast.error("Failed to update archive status");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [`/api/v1/applications/job/${jobId}`],
        });
        queryClient.invalidateQueries({
          queryKey: getGetJobApplicationStatsQueryKey(jobId),
        });
      },
    },
  });
};
