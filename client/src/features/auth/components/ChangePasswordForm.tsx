"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { useChangePassword } from "@/shared/api/generated/auth/auth";
import { toast } from "sonner";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm: React.FC = () => {
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });

      toast.success("Password changed successfully");
      reset(); // Clear the form
    } catch (error) {
      setError("root", {
        type: "manual",
        message: getApiError(error, "Failed to change password. Please check your current password and try again."),
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card p-6 rounded-2xl border border-border shadow-sm max-w-xl"
    >
      <div className="mb-6">
        <h2 className="text-xl font-headline font-semibold text-foreground mb-1">
          Change Password
        </h2>
        <p className="text-xs text-muted-foreground">
          Update your account password.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          placeholder="Enter current password"
          {...register("currentPassword")}
          error={errors.currentPassword?.message}
        />

        <div className="pt-2">
          <Input
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>
      
      <FormError message={errors.root?.message} className="mt-4" />

      <div className="mt-8 flex items-center justify-end border-t border-border/50 pt-5">
        <Button type="submit" disabled={changePasswordMutation.isPending}>
          Change Password
        </Button>
      </div>
    </form>
  );
};
