import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  useCreateJob as useOrvalCreateJob, 
  useUpdateJob as useOrvalUpdateJob, 
  getGetCompanyJobsQueryKey 
} from "@/shared/api/generated/jobs/jobs";
import { customAxiosInstance } from "@/shared/api/axios-instance";

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
      onSuccess: (response, variables) => {
        const queries = queryClient.getQueriesData({ queryKey: getGetCompanyJobsQueryKey() });
        queries.forEach(([queryKey, oldData]: [any, any]) => {
          if (!oldData || !oldData.data || !oldData.data.data) return;

          const params = queryKey[1] as any;
          let newDataArray = oldData.data.data;

          if (params?.status && params.status !== "ALL" && params.status !== response.data.status) {
            // Remove if it no longer matches the tab's status filter
            newDataArray = newDataArray.filter((j: any) => j.id !== variables.id);
          } else {
            // Update it if it exists, or prepend if it should be in this tab but isn't
            const exists = newDataArray.some((j: any) => j.id === variables.id);
            if (exists) {
              newDataArray = newDataArray.map((j: any) =>
                j.id === variables.id ? { ...j, ...response.data } : j
              );
            } else if (!params?.page || params.page === 1) {
              newDataArray = [response.data, ...newDataArray];
            }
          }

          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              data: newDataArray,
            },
          });
        });
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
