import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateMemberRole as useOrvalUpdateMemberRole,
  useRemoveMember as useOrvalRemoveMember,
  useSuspendMember as useOrvalSuspendMember,
  useActivateMember as useOrvalActivateMember,
  getGetMembersQueryKey,
} from "@/shared/api/generated/company-members/company-members";

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useOrvalUpdateMemberRole({
    mutation: {
      onSuccess: (response, variables) => {
        queryClient.setQueriesData(
          { queryKey: getGetMembersQueryKey() },
          (oldData: any) => {
            if (!oldData || !oldData.data || !oldData.data.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.map((m: any) =>
                  m.userId === variables.userId ? { ...m, ...response.data } : m
                ),
              },
            };
          }
        );
      },
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useOrvalRemoveMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};

export const useSuspendMember = () => {
  const queryClient = useQueryClient();

  return useOrvalSuspendMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};

export const useActivateMember = () => {
  const queryClient = useQueryClient();

  return useOrvalActivateMember({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};
