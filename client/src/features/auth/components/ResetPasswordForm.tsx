"use client";

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useConfirmResetPassword } from '@/shared/api/generated/auth/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { MdCheckCircle } from 'react-icons/md';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordFormInner: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const confirmResetMutation = useConfirmResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('root', { type: 'manual', message: 'Missing reset token in URL.' });
      return;
    }

    try {
      await confirmResetMutation.mutateAsync({
        data: {
          token,
          newPassword: data.newPassword,
        },
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: getApiError(error, 'Failed to reset password. The link might be expired.'),
      });
    }
  };

  if (!token && !success) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xl">
        <h2 className="text-xl font-headline text-red-500 mb-2">Invalid Link</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The password reset link is invalid or missing. Please request a new one.
        </p>
        <Button onClick={() => router.push('/auth')} fullWidth>
          Go to Login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xl">
        <MdCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-headline text-foreground mb-2">Password Reset!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your password has been successfully updated. Redirecting you to login...
        </p>
        <Button onClick={() => router.push('/auth')} fullWidth variant="secondary">
          Go to Login Now
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
      <h2 className="text-2xl font-headline text-foreground mb-2">Create New Password</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Please enter and confirm your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="Min 8 characters"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <FormError message={errors.root?.message} className="mb-2" />

        <Button 
          type="submit" 
          fullWidth 
          className="mt-4" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
};

export const ResetPasswordForm: React.FC = () => {
  return (
    <Suspense fallback={<div className="animate-pulse bg-card p-8 rounded-2xl h-100 w-full max-w-md border border-border"></div>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
};
