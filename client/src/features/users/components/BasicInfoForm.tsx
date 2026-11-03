"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { useUpdateProfile } from '@/shared/api/generated/users/users';
import { toast } from 'sonner';
import { User, UserGender } from '@/shared/api/generated/model';
import { useAuthStore } from '@/shared/stores/auth-store';
import { AvatarUpload } from './AvatarUpload';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const basicInfoSchema = z.object({
  firstName: z.string().min(2, 'First name is required').max(50),
  lastName: z.string().min(2, 'Last name is required').max(50),
  email: z.string().email(),
  phoneNumber: z.string().max(20).optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  user: User | null;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ user }) => {
  const updateProfileMutation = useUpdateProfile();
  const setAuth = useAuthStore((s) => s.setAuth);
  const organizationId = useAuthStore((s) => s.organizationId);
  const companyRole = useAuthStore((s) => s.companyRole);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dob: user?.dob ? user.dob.split('T')[0] : '', 
      gender: user?.gender || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      const response = await updateProfileMutation.mutateAsync({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || undefined,
          dob: data.dob ? new Date(data.dob).toISOString() : undefined,
          gender: (data.gender as UserGender) || undefined,
        },
      });
      
      toast.success('Basic info updated successfully');
      
      // Update the user in the global store
      if (response && response.data) {
        setAuth(response.data, organizationId, companyRole);
      }
      
      reset(data);
    } catch (error) {
      console.error('Failed to update basic info:', error);
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to update basic info. Please try again.') });
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-headline font-semibold text-foreground mb-1">
          Basic Information
        </h2>
        <p className="text-xs text-muted-foreground">
          Update your name and contact details.
        </p>
      </div>

      <AvatarUpload />

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormError message={errors.root?.message} className="mb-4" />
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. Ahmed"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="e.g. Ossama"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            disabled
            className="bg-input/50 text-muted-foreground cursor-not-allowed"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +1 (555) 000-0000"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Gender"
              {...register('gender')}
              error={errors.gender?.message}
              options={[
                { label: 'Select Gender', value: '' },
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ]}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...register('dob')}
              error={errors.dob?.message}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end border-t border-border/50 pt-5">
          <Button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
