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
import { CountryCitySelect } from '@/shared/components/ui/CountryCitySelect';

import { CompanyImageUpload } from './CompanyImageUpload';

const companySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().refine(val => !val || /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(val), 'Invalid website').optional().or(z.literal('')),
  foundedYear: z.string().optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  specialties: z.string().optional().or(z.literal('')), // user can type comma-separated string, we'll parse to array
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
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'onBlur',
    defaultValues: {
      name: initialData.name || '',
      description: initialData.description || '',
      country: initialData.country || '',
      city: initialData.city || '',
      address: initialData.address || '',
      email: initialData.email || '',
      website: initialData.website || '',
      foundedYear: initialData.foundedYear ? `${initialData.foundedYear}-01-01` : '',
      phone: initialData.phone || '',
      specialties: initialData.specialties?.join(', ') || '',
      size: initialData.size || '',
      industry: initialData.industry || '',
    },
  });

  const selectedCountry = watch('country') || '';
  const selectedCity = watch('city') || '';

  const onSubmit = async (data: CompanyFormData) => {
    try {
      const payload = {
        name: data.name,
        ...(data.description ? { description: data.description } : {}),
        ...(data.country ? { country: data.country } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.email ? { email: data.email } : {}),
        ...(data.website ? { website: data.website.startsWith('http') ? data.website : `https://${data.website}` } : {}),
        ...(data.foundedYear ? { foundedYear: new Date(data.foundedYear).getFullYear() } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.specialties ? { specialties: data.specialties.split(',').map(s => s.trim()).filter(Boolean) } : {}),
        ...(data.size ? { size: data.size } : {}),
        ...(data.industry ? { industry: data.industry } : {}),
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormError message={errors.root?.message} />

        {/* General Information */}
        <section className="space-y-5">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">General Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Founded Date"
              type="date"
              {...register('foundedYear')} 
              error={errors.foundedYear?.message}
            />
            <div className="sm:col-span-2">
              <Input 
                label="Specialties (comma-separated)"
                {...register('specialties')} 
                placeholder="e.g. Corrugated Carton, Printing, Packaging Machinery" 
                error={errors.specialties?.message}
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea 
                label="Company Description"
                {...register('description')} 
                placeholder="Tell candidates about your company mission and culture..." 
                rows={4}
                error={errors.description?.message}
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-5">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Email"
              type="email"
              {...register('email')} 
              placeholder="e.g. contact@company.com" 
              error={errors.email?.message}
            />
            <Input 
              label="Phone"
              {...register('phone')} 
              placeholder="e.g. +1 555 123 4567" 
              error={errors.phone?.message}
            />
            <Input 
              label="Website"
              type="text"
              {...register('website')} 
              placeholder="e.g. company.com" 
              error={errors.website?.message}
            />
          </div>
        </section>

        {/* Location Information */}
        <section className="space-y-5">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Location Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CountryCitySelect
              countryLabel="Country"
              cityLabel="City"
              countryCode={selectedCountry}
              cityName={selectedCity}
              onCountryChange={(code) => setValue("country", code, { shouldValidate: true })}
              onCityChange={(city) => setValue("city", city, { shouldValidate: true })}
              countryError={errors.country?.message}
              cityError={errors.city?.message}
            />
            <div className="sm:col-span-2">
              <Input 
                label="Address"
                {...register('address')} 
                placeholder="e.g. 123 Main St" 
                error={errors.address?.message}
              />
            </div>
          </div>
        </section>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting || (!isDirty && !isSubmitting)}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
