"use client";

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@/shared/components/ui';
import { useAcceptInvite } from '@/shared/api/generated/auth/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { MdCheckCircle } from 'react-icons/md';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const acceptInviteSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

const AcceptInviteFormInner: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const acceptInviteMutation = useAcceptInvite();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!token) {
      setError('root', { type: 'manual', message: 'Missing invite token in URL.' });
      return;
    }

    try {
      await acceptInviteMutation.mutateAsync({
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
      console.error('Invite acceptance failed:', error);
      setError('root', {
        type: 'manual',
        message: getApiError(error, 'Failed to accept invite. The link might be expired.'),
      });
    }
  };

  if (!token && !success) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <h2 className="text-xl font-headline text-red-500 mb-2">Invalid Link</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The invitation link is invalid or missing. Please ask your company administrator to send a new invite.
        </p>
        <Button onClick={() => router.push('/auth')} fullWidth>
          Go to Login
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xl max-w-md w-full">
        <MdCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-headline text-foreground mb-2">Account Created!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You have successfully joined the company. Redirecting you to login...
        </p>
        <Button onClick={() => router.push('/auth')} fullWidth variant="secondary">
          Go to Login Now
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-card rounded-2xl border border-border shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-headline text-foreground mb-2">Welcome to Technically</h2>
      <p className="text-sm text-muted-foreground mb-6">
        You've been invited to join a company! Please set a password to finalize your account.
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
          label="Confirm Password"
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
          {isSubmitting ? 'Finalizing...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

export const AcceptInviteForm: React.FC = () => {
  return (
    <Suspense fallback={<div className="animate-pulse bg-card p-8 rounded-2xl h-100 w-full max-w-md border border-border mx-auto"></div>}>
      <AcceptInviteFormInner />
    </Suspense>
  );
};
