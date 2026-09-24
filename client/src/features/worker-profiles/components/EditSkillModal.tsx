"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, Button, Select, Input } from '@/shared/components/ui';
import { useUpdateSkill } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMyProfileQueryKey } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { WorkerMachineSkill } from '@/shared/api/generated/model';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const editSkillSchema = z.object({
  experienceLevel: z.enum(['ENTRY_LEVEL', 'SKILLED', 'SENIOR', 'EXPERT']),
  yearsOfExperience: z.coerce.number().min(0, 'Cannot be negative').max(60, 'Invalid years of experience'),
});

type EditSkillFormData = z.infer<typeof editSkillSchema>;

interface EditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: WorkerMachineSkill | null;
}

export const EditSkillModal: React.FC<EditSkillModalProps> = ({ isOpen, onClose, skill }) => {
  const queryClient = useQueryClient();
  const updateSkillMutation = useUpdateSkill();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditSkillFormData>({
    resolver: zodResolver(editSkillSchema),
    mode: 'onBlur',
    defaultValues: {
      experienceLevel: skill?.experienceLevel || 'ENTRY_LEVEL',
      yearsOfExperience: skill?.yearsOfExperience || 0,
    }
  });

  useEffect(() => {
    if (skill && isOpen) {
      reset({
        experienceLevel: skill.experienceLevel as any,
        yearsOfExperience: skill.yearsOfExperience,
      });
    }
  }, [skill, isOpen, reset]);

  const onSubmit = async (data: EditSkillFormData) => {
    if (!skill) return;
    
    try {
      await updateSkillMutation.mutateAsync({
        skillId: skill.id,
        data: {
          experienceLevel: data.experienceLevel as any,
          yearsOfExperience: data.yearsOfExperience,
        }
      });
      // Invalidate profile query to refetch skills
      queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      toast.success("Skill updated successfully");
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to update skill:', error);
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to update skill') });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Machine Skill">
      {skill && (
        <div className="mb-4 p-3 bg-input border border-border rounded-lg text-sm text-foreground">
          <strong>Machine:</strong> {skill.machineNameEn || skill.machineId}
          {skill.categoryNameEn && (
             <span className="text-muted-foreground ml-2">({skill.categoryNameEn})</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={errors.root?.message} className="mb-2" />
        
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
