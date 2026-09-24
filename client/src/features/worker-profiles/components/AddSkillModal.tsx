"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Select, Input } from '@/shared/components/ui';
import { useAddSkill } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { useGetMachines } from '@/shared/api/generated/machines/machines';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getGetMyProfileQueryKey } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

import { Machine } from '@/shared/api/generated/model';

const addSkillSchema = z.object({
  machineId: z.string().min(1, 'Machine selection is required'),
  experienceLevel: z.enum(['ENTRY_LEVEL', 'SKILLED', 'SENIOR', 'EXPERT']),
  yearsOfExperience: z.coerce.number().min(0, 'Cannot be negative').max(60, 'Invalid years of experience'),
});

type AddSkillFormData = z.infer<typeof addSkillSchema>;

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const addSkillMutation = useAddSkill();

  // Basic fetch of machines for the dropdown
  // later : need search/pagination ().
  // For now, fetching first 100
  const { data: machinesResponse, isLoading: isLoadingMachines } = useGetMachines({ limit: 100 });
  const machines: Machine[] = machinesResponse?.data?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddSkillFormData>({
    resolver: zodResolver(addSkillSchema),
    mode: 'onBlur',
    defaultValues: {
      machineId: '',
      experienceLevel: 'ENTRY_LEVEL',
      yearsOfExperience: 0,
    }
  });

  const onSubmit = async (data: AddSkillFormData) => {
    try {
      await addSkillMutation.mutateAsync({
        data: {
          machineId: data.machineId,
          experienceLevel: data.experienceLevel as any,
          yearsOfExperience: data.yearsOfExperience,
        }
      });
      // Invalidate profile query to refetch skills
      queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      toast.success("Skill added successfully");
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add skill:', error);
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to add skill') });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Machine Skill">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormError message={errors.root?.message} className="mb-2" />
        
        <Select
          label="Select Machine"
          {...register('machineId')}
          error={errors.machineId?.message}
          options={
            isLoadingMachines
              ? [{ value: '', label: 'Loading machines...' }]
              : [
                  { value: '', label: 'Select a machine...' },
                  ...machines.map(m => ({
                    value: m.id,
                    label: m.nameEn || m.id, // Fallback if nameEn is missing
                  }))
                ]
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Experience Level"
            {...register('experienceLevel')}
            error={errors.experienceLevel?.message}
            options={[
              { value: 'ENTRY_LEVEL', label: 'Entry Level (0-2 yrs)' },
              { value: 'SKILLED', label: 'Skilled (2-5 yrs)' },
              { value: 'SENIOR', label: 'Senior (5-10 yrs)' },
              { value: 'EXPERT', label: 'Expert (10+ yrs)' },
            ]}
          />

          <Input
            label="Years of Exp."
            type="number"
            min={0}
            step={1}
            {...register('yearsOfExperience')}
            error={errors.yearsOfExperience?.message}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingMachines}>
            {isSubmitting ? 'Adding...' : 'Add Skill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
