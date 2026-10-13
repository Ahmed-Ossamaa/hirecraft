"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Textarea, CountryCitySelect, Select } from '@/shared/components/ui';
import { useCreateWorkerProfile, useUpdateWorkerProfile } from "@/features/worker-profiles/api/useProfileMutations";
import { toast } from 'sonner';
import { WorkerProfile } from '@/shared/api/generated/model';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const profileSchema = z.object({
  title: z.string().min(2, 'Job title is required').max(100),
  lastCompany: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  educationLevel: z.enum(['HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'OTHER']).optional(),
  educationDetails: z.string().max(200).optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: WorkerProfile | null;
  onSuccess?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSuccess }) => {
  const createProfileMutation = useCreateWorkerProfile();
  const updateProfileMutation = useUpdateWorkerProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      title: initialData?.title || '',
      lastCompany: initialData?.lastCompany || '',
      bio: initialData?.bio || '',
      country: initialData?.country || '',
      city: initialData?.city || '',
      // @ts-ignore
      educationLevel: initialData?.educationLevel || undefined,
      educationDetails: initialData?.educationDetails || '',
    },
  });

  // Re-initialize if initialData loads after component mount
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        lastCompany: initialData.lastCompany || '',
        bio: initialData.bio || '',
        country: initialData.country || '',
        city: initialData.city || '',
        educationLevel: initialData.educationLevel || undefined,
        educationDetails: initialData.educationDetails || '',
      });
    }
  }, [initialData, reset]);

  const country = watch('country');
  const city = watch('city');

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
        title: data.title,
        country: data.country,
        city: data.city,
        ...(data.lastCompany ? { lastCompany: data.lastCompany } : {}),
        ...(data.bio ? { bio: data.bio } : {}),
        ...(data.educationLevel ? { educationLevel: data.educationLevel } : {}),
        ...(data.educationDetails ? { educationDetails: data.educationDetails } : {}),
      };

      if (initialData) {
        await updateProfileMutation.mutateAsync({ data: payload });
        toast.success("Profile updated successfully");
      } else {
        await createProfileMutation.mutateAsync({ data: payload });
        toast.success("Profile created successfully");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to save profile. Please try again.') });
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <h2 className="text-xl font-headline font-semibold text-foreground mb-1">
        {initialData ? 'Edit Basic Information' : 'Create Your Profile'}
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        {initialData 
          ? 'Update your professional title, location, and bio.'
          : 'Set up your profile to start applying for specialized roles.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={errors.root?.message} className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Professional Title"
            placeholder="e.g. CNC Operator, Maintenance Mechanic"
            {...register('title')}
            error={errors.title?.message}
          />
          <Input
            label="Last/Current Company (Optional)"
            placeholder="e.g. Acme Manufacturing"
            {...register('lastCompany')}
            error={errors.lastCompany?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CountryCitySelect
            countryLabel="Country"
            cityLabel="City"
            countryCode={country}
            cityName={city}
            onCountryChange={(val) => {
              setValue('country', val, { shouldValidate: true });
              setValue('city', '', { shouldValidate: true }); // reset city on country change
            }}
            onCityChange={(val) => setValue('city', val, { shouldValidate: true })}
            countryError={errors.country?.message}
            cityError={errors.city?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Education Level"
            {...register('educationLevel')}
            error={errors.educationLevel?.message}
            options={[
              { value: '', label: 'Select education level...' },
              { value: 'HIGH_SCHOOL', label: 'High School' },
              { value: 'VOCATIONAL', label: 'Vocational / Technical Institute' },
              { value: 'ASSOCIATE', label: 'Associate Degree' },
              { value: 'BACHELOR', label: 'Bachelor\'s Degree' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <Input
            label="Education Details (Optional)"
            placeholder="e.g. Don Bosco Institute, Alexandria"
            {...register('educationDetails')}
            error={errors.educationDetails?.message}
          />
        </div>

        <Textarea
          label="Professional Summary / Bio (Optional)"
          placeholder="Briefly describe your experience and what you're looking for..."
          {...register('bio')}
          error={errors.bio?.message}
          rows={4}
        />

        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
