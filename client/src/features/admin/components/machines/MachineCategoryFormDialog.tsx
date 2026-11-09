"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";
import { useMachineCategoryMutations } from "../../hooks/useMachineMutations";
import { MachineCategory } from "@/shared/api/generated/model";

const machineCategorySchema = z.object({
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
});

type MachineCategoryFormData = z.infer<typeof machineCategorySchema>;

interface MachineCategoryFormDialogProps {
  isOpen: boolean;
  category: MachineCategory | null;
  onClose: () => void;
}

export const MachineCategoryFormDialog: React.FC<
  MachineCategoryFormDialogProps
> = ({ isOpen, category, onClose }) => {
  const isEditing = Boolean(category);

  const { createMutation, updateMutation } = useMachineCategoryMutations();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MachineCategoryFormData>({
    resolver: zodResolver(machineCategorySchema),
    mode: "onBlur",
    defaultValues: {
      nameEn: "",
      nameAr: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      nameEn: category?.nameEn ?? "",
      nameAr: category?.nameAr ?? "",
    });
  }, [isOpen, category, reset]);

  const onSubmit = async (data: MachineCategoryFormData) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
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
          `Failed to ${isEditing ? "update" : "create"} category`,
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
      title={isEditing ? "Edit Category" : "Add Category"}
      closeOnclick={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormError message={errors.root?.message} className="mb-2" />

        <Input
          label="English Name"
          placeholder="e.g. Textile"
          maxLength={100}
          {...register("nameEn")}
          error={errors.nameEn?.message}
        />

        <Input
          label="Arabic Name"
          placeholder="مثال: المنسوجات"
          maxLength={100}
          {...register("nameAr")}
          error={errors.nameAr?.message}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
