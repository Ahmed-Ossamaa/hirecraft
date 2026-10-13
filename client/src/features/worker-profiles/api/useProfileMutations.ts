import { useQueryClient } from "@tanstack/react-query";
import {
  useUpdateWorkerProfile as useOrvalUpdateWorkerProfile,
  useCreateProfile as useOrvalCreateProfile,
  useAddSkill as useOrvalAddSkill,
  useUpdateSkill as useOrvalUpdateSkill,
  useDeleteSkill as useOrvalDeleteSkill,
  getGetMyProfileQueryKey,
} from "@/shared/api/generated/worker-profiles/worker-profiles";

export const useUpdateWorkerProfile = () => {
  const queryClient = useQueryClient();

  return useOrvalUpdateWorkerProfile({
    mutation: {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetMyProfileQueryKey(), (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...response.data,
            },
          };
        });
      },
    },
  });
};

export const useCreateWorkerProfile = () => {
  const queryClient = useQueryClient();

  return useOrvalCreateProfile({
    mutation: {
      onSuccess: (response) => {
        if (!response) return;
        queryClient.setQueryData(getGetMyProfileQueryKey(), (oldData: any) => {
          const newData = response.data;
          if (!oldData) return { data: newData };
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...newData,
            },
          };
        });
      },
    },
  });
};

export const useUpdateMachineSkill = () => {
  const queryClient = useQueryClient();

  return useOrvalUpdateSkill({
    mutation: {
      onSuccess: (response, variables) => {
        queryClient.setQueryData(getGetMyProfileQueryKey(), (oldData: any) => {
          if (!oldData || !oldData.data || !oldData.data.machineSkills)
            return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              machineSkills: oldData.data.machineSkills.map((skill: any) =>
                skill.id === variables.skillId
                  ? { ...skill, ...response.data }
                  : skill,
              ),
            },
          };
        });
      },
    },
  });
};

export const useAddMachineSkill = () => {
  const queryClient = useQueryClient();

  return useOrvalAddSkill({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
    },
  });
};

export const useRemoveMachineSkill = () => {
  const queryClient = useQueryClient();

  return useOrvalDeleteSkill({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
    },
  });
};
