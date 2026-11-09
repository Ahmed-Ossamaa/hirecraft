"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { Input } from "@/shared/components/ui/Input";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";

import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";

import { useMachineMutations } from "../../hooks/useMachineMutations";
import type { Machine, MachineCategory } from "@/shared/api/generated/model";

const machineSchema = z.object({
  nameEn: z
    .string()
    .trim()
    .min(1, "English name is required")
    .max(100, "Name cannot exceed 100 characters"),

  nameAr: z
    .string()
    .trim()
    .min(1, "Arabic name is required")
    .max(100, "Name cannot exceed 100 characters"),

  categoryId: z.string().min(1, "Category selection is required"),
});

type MachineFormData = z.infer<typeof machineSchema>;

interface MachineFormDialogProps {
  isOpen: boolean;
  machine: Machine | null;
  onClose: () => void;
}

export const MachineFormDialog: React.FC<MachineFormDialogProps> = ({
  isOpen,
  machine,
  onClose,
}) => {
  const isEditing = Boolean(machine);

  const { createMutation, updateMutation } = useMachineMutations();

  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetMachineCategories({
      page: 1,
      limit: 100,
    });

  const categories: MachineCategory[] = categoriesResponse?.data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    mode: "onBlur",
    defaultValues: {
      nameEn: "",
      nameAr: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      nameEn: machine?.nameEn ?? "",
      nameAr: machine?.nameAr ?? "",
      categoryId: machine?.categoryId ?? "",
    });
  }, [isOpen, machine, reset]);

  const onSubmit = async (data: MachineFormData) => {
    try {
      if (machine) {
        await updateMutation.mutateAsync({
          id: machine.id,
          data,
        });
      } else {
        await createMutation.mutateAsync({ data });
      }

      reset();
      onClose();
    } catch (error) {
      setError("root", {
        type: "manual",
        message: getApiError(
          error,
          `Failed to ${isEditing ? "update" : "create"} machine`,
        ),
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Machine" : "Add Machine"}
      closeOnclick={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormError message={errors.root?.message} className="mb-2" />

        <Input
          label="English Name"
          placeholder="e.g. CNC Milling Machine"
          maxLength={100}
          {...register("nameEn")}
          error={errors.nameEn?.message}
        />

        <Input
          label="Arabic Name"
          placeholder="مثال: ماكينة تفريز CNC"
          maxLength={100}
          {...register("nameAr")}
          error={errors.nameAr?.message}
        />

        <Select
          label="Machine Category"
          {...register("categoryId")}
          error={errors.categoryId?.message}
          options={[
            {
              value: "",
              label: isLoadingCategories
                ? "Loading categories..."
                : "Select a category...",
            },
            ...categories.map((category) => ({
              value: category.id,
              label: `${category.nameEn} - ${category.nameAr}`,
            })),
          ]}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting || isLoadingCategories}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Machine"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
