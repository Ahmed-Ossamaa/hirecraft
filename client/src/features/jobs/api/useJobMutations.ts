import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  useCreateJob as useOrvalCreateJob, 
  useUpdateJob as useOrvalUpdateJob, 
  getGetCompanyJobsQueryKey,
  getGetJobByIdQueryKey,
} from "@/shared/api/generated/jobs/jobs";
import { customAxiosInstance } from "@/shared/api/axios-instance";
import type { GetCompanyJobs200, GetJobById200, Job, JobWithStatsDto } from "@/shared/api/generated/model";

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useOrvalCreateJob({
    mutation: {
      onSuccess: () => {
        // Refetch the list after a new job is posted
        queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
      },
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useOrvalUpdateJob({
    mutation: {
      onMutate: async (variables) => {
        // Cancel any  on the go queries to prevent overwriting optimistic updates
        await queryClient.cancelQueries({ queryKey: getGetCompanyJobsQueryKey() });
        await queryClient.cancelQueries({ queryKey: getGetJobByIdQueryKey(variables.id) });

        // previous values
        const previousCompanyQueries = queryClient.getQueriesData({
          queryKey: getGetCompanyJobsQueryKey(),
        });
        const previousJobDetail = queryClient.getQueryData<GetJobById200>(
          getGetJobByIdQueryKey(variables.id)
        );

        // Optimistic update company-job list caches
        previousCompanyQueries.forEach(([queryKey, oldData]: [any, any]) => {
          if (!oldData?.data?.data) return;

          const params = queryKey[1] as any;
          let newDataArray = oldData.data.data;

          if (
            variables.data.status &&
            params?.status &&
            params.status !== "ALL" &&
            params.status !== variables.data.status
          ) {
            // Remove if it no longer matches the tab's status filter
            newDataArray = newDataArray.filter((j: any) => j.id !== variables.id);
          } else {
            // Update in place if present
            newDataArray = newDataArray.map((j: any) =>
              j.id === variables.id ? { ...j, ...variables.data } : j
            );
          }

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              data: newDataArray,
            },
          });
        });

        //Optimistically update job-detail cache if currently cached
        if (previousJobDetail?.data) {
          queryClient.setQueryData(getGetJobByIdQueryKey(variables.id), (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                ...variables.data,
              },
            };
          });
        }

        return { previousCompanyQueries, previousJobDetail };
      },
      onError: (_err, variables, context: any) => {
        // Restore snapshots on error
        if (context?.previousCompanyQueries) {
          context.previousCompanyQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
        if (context?.previousJobDetail) {
          queryClient.setQueryData(
            getGetJobByIdQueryKey(variables.id),
            context.previousJobDetail
          );
        }
      },
      onSuccess: (response, variables) => {
        // Write the server response directly to the detail cache
        if (response?.data) {
          queryClient.setQueryData(
            getGetJobByIdQueryKey(variables.id),
            response
          );
        }

        // Invalidate company-job lists to ensure counts, pagination & sorting consistency
        queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
      },
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      customAxiosInstance({
        url: `/api/v1/jobs/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      // Invalidate to properly handle paginated deletion shifts
      queryClient.invalidateQueries({ queryKey: getGetCompanyJobsQueryKey() });
    },
  });
};
