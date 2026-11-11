import { useQueryClient } from "@tanstack/react-query";
import {
  useApplyToJob as useOrvalApplyToJob,
  getGetMyApplicationsQueryKey,
} from "@/shared/api/generated/job-applications/job-applications";

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useOrvalApplyToJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetMyApplicationsQueryKey(),
        });
      },
    },
  });
};
