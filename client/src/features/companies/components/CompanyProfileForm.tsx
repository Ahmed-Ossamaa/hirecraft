"use client";

import React, {useState} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Textarea, Select } from '@/shared/components/ui';
import { useUpdateCompanyProfile } from '@/shared/api/generated/companies/companies';
import { toast } from 'sonner';
import { Company } from '@/shared/api/generated/model';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';
import { INDUSTRY_SECTOR_OPTIONS, COMPANY_SIZE_OPTIONS } from '@/shared/constants/employer-options';

import { CompanyImageUpload } from './CompanyImageUpload';

const companySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  size: z.string().max(50).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyProfileProps {
  initialData: Company;
  onSuccess?: () => void;
}

export const CompanyProfileForm: React.FC<CompanyProfileProps> = ({ initialData, onSuccess }) => {
  const updateCompanyMutation = useUpdateCompanyProfile();
  
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData.logoUrl || null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialData.coverUrl || null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'onBlur',
    defaultValues: {
      name: initialData.name || '',
      description: initialData.description || '',
      location: initialData.location || '',
      size: initialData.size || '',
      industry: initialData.industry || '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const payload = {
        name: data.name,
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.size !== undefined ? { size: data.size } : {}),
        ...(data.industry !== undefined ? { industry: data.industry } : {}),
      };

      await updateCompanyMutation.mutateAsync({ data: payload });
      toast.success("Company profile updated successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to update company:', error);
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to update company. Please try again.') });
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <h3 className="font-headline text-xl font-semibold mb-6">Company Profile</h3>
      
      <CompanyImageUpload type="cover" currentUrl={coverUrl} onSuccess={setCoverUrl} />
      <CompanyImageUpload type="logo" currentUrl={logoUrl} onSuccess={setLogoUrl} />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormError message={errors.root?.message} />

        <Input 
          label="Company Name *"
          {...register('name')} 
          placeholder="e.g. Acme Corp" 
          error={errors.name?.message}
        />

        <Select 
          label="Industry"
          {...register('industry')}
          options={[
            { value: '', label: 'Select an industry...' },
            ...INDUSTRY_SECTOR_OPTIONS
          ]}
          error={errors.industry?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select 
            label="Company Size"
            {...register('size')}
            options={[
              { value: '', label: 'Select company size...' },
              ...COMPANY_SIZE_OPTIONS
            ]}
            error={errors.size?.message}
          />
          <Input 
            label="Headquarters Location"
            {...register('location')} 
            placeholder="e.g. Chicago, IL" 
            error={errors.location?.message}
          />
        </div>

        <Textarea 
          label="Company Description"
          {...register('description')} 
          placeholder="Tell candidates about your company mission and culture..." 
          rows={4}
          error={errors.description?.message}
        />

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting || (!isDirty && !isSubmitting)}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
