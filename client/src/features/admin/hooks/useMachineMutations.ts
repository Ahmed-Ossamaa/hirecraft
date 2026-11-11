"use client";

import { getGetMachinesQueryKey } from "@/shared/api/generated/machines/machines";
import {
  useCreateMachine,
  useDeleteMachine,
  useUpdateMachine,
} from "@/shared/api/generated/admin-machines/admin-machines";
import { getGetMachineCategoriesQueryKey } from "@/shared/api/generated/machine-categories/machine-categories";
import {
  useCreateMachineCategory,
  useDeleteMachineCategory,
  useUpdateMachineCategory,
} from "@/shared/api/generated/admin-machine-categories/admin-machine-categories";
import { getApiError } from "@/shared/utils/error";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMachineMutations() {
  const queryClient = useQueryClient();

  const invalidateMachines = () =>
    queryClient.invalidateQueries({
      queryKey: getGetMachinesQueryKey(),
    });

  const createMutation = useCreateMachine({
    mutation: {
      onSuccess: () => {
        toast.success("Machine created successfully");
        invalidateMachines();
      },
    },
  });

  const updateMutation = useUpdateMachine({
    mutation: {
      onSuccess: () => {
        toast.success("Machine updated successfully");
        invalidateMachines();
      },
    },
  });

  const deleteMutation = useDeleteMachine({
    mutation: {
      onSuccess: () => {
        toast.success("Machine deleted successfully");
        invalidateMachines();
      },
      onError: (err) => {
        handleError(err, "Failed to delete machine");
      },
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

export function useMachineCategoryMutations() {
  const queryClient = useQueryClient();

  const invalidateCategories = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetMachineCategoriesQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetMachinesQueryKey(),
      }),
    ]);
  };

  const createMutation = useCreateMachineCategory({
    mutation: {
      onSuccess: async () => {
        toast.success("Machine category created successfully");
        await invalidateCategories();
      },
    },
  });

  const updateMutation = useUpdateMachineCategory({
    mutation: {
      onSuccess: async () => {
        toast.success("Machine category updated successfully");
        await invalidateCategories();
      },
    },
  });

  const deleteMutation = useDeleteMachineCategory({
    mutation: {
      onSuccess: async () => {
        toast.success("Machine category deleted successfully");
        await invalidateCategories();
      },
      onError: (err) => {
        handleError(err, "Failed to delete machine category");
      },
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

const handleError = (error: unknown, message: string) => {
  toast.error(getApiError(error, message));
};
