"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@/shared/components/ui';
import { useResetPassword } from '@/shared/api/generated/auth/auth';
import { MdClose } from 'react-icons/md';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [success, setSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        data: { email: data.email },
      });
      setSuccess(true);
    } catch (error: any) {
      console.error('Reset password request failed:', error);
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl relative overflow-hidden flex flex-col">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-input hover:bg-border text-muted-foreground transition-colors z-10"
        >
          <MdClose />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="font-headline text-2xl text-foreground mb-2">Reset Password</h2>
          
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent password reset instructions to your email address.
              </p>
              <Button onClick={onClose} fullWidth className="mt-6" variant="secondary">
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@domain.pro"
                  {...register('email')}
                  error={errors.email?.message}
                />

                {errors.root && (
                  <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono mb-2">
                    {errors.root.message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  fullWidth 
                  className="mt-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
