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
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: getGetMembersQueryKey() });
        const previousQueries = queryClient.getQueriesData({ queryKey: getGetMembersQueryKey() });

        queryClient.setQueriesData(
          { queryKey: getGetMembersQueryKey() },
          (oldData: any) => {
            if (!oldData?.data?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.map((m: any) =>
                  m.userId === variables.userId ? { ...m, role: variables.data.role } : m
                ),
              },
            };
          }
        );

        return { previousQueries };
      },
      onSuccess: (response, variables) => {
        if (response?.data) {
          queryClient.setQueriesData(
            { queryKey: getGetMembersQueryKey() },
            (oldData: any) => {
              if (!oldData?.data?.data) return oldData;
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
        }
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useOrvalRemoveMember({
    mutation: {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: getGetMembersQueryKey() });
        const previousQueries = queryClient.getQueriesData({ queryKey: getGetMembersQueryKey() });

        queryClient.setQueriesData(
          { queryKey: getGetMembersQueryKey() },
          (oldData: any) => {
            if (!oldData?.data?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.filter((m: any) => m.userId !== variables.userId),
              },
            };
          }
        );

        return { previousQueries };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};

export const useSuspendMember = () => {
  const queryClient = useQueryClient();

  return useOrvalSuspendMember({
    mutation: {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: getGetMembersQueryKey() });
        const previousQueries = queryClient.getQueriesData({ queryKey: getGetMembersQueryKey() });

        queryClient.setQueriesData(
          { queryKey: getGetMembersQueryKey() },
          (oldData: any) => {
            if (!oldData?.data?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.map((m: any) =>
                  m.userId === variables.userId ? { ...m, status: "SUSPENDED" } : m
                ),
              },
            };
          }
        );

        return { previousQueries };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};

export const useActivateMember = () => {
  const queryClient = useQueryClient();

  return useOrvalActivateMember({
    mutation: {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: getGetMembersQueryKey() });
        const previousQueries = queryClient.getQueriesData({ queryKey: getGetMembersQueryKey() });

        queryClient.setQueriesData(
          { queryKey: getGetMembersQueryKey() },
          (oldData: any) => {
            if (!oldData?.data?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.map((m: any) =>
                  m.userId === variables.userId ? { ...m, status: "ACTIVE" } : m
                ),
              },
            };
          }
        );

        return { previousQueries };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousQueries) {
          context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
            queryClient.setQueryData(queryKey, oldData);
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() });
      },
    },
  });
};
