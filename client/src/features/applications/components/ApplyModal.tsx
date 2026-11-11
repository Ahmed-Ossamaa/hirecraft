"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';
import { useApplyToJob } from "@/features/applications/api/useApplicationMutations";

const applySchema = z.object({
  coverLetter: z.string().max(2000).optional().or(z.literal('')),
});

type ApplyFormData = z.infer<typeof applySchema>;

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle, 
  companyName 
}) => {
  const applyMutation = useApplyToJob();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    mode: 'onBlur',
    defaultValues: {
      coverLetter: '',
    },
  });

  const onSubmit = async (data: ApplyFormData) => {
    try {
      await applyMutation.mutateAsync({
        data: {
          jobId,
          coverLetter: data.coverLetter || undefined,
        },
      });
      
      toast.success("Application submitted successfully!");
      
      handleClose();
    } catch (error) {
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to submit application. Please make sure your worker profile is complete.') });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Application">
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-1">{jobTitle}</h3>
        <p className="text-xs text-muted-foreground">{companyName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={errors.root?.message} className="mb-2" />
        
        <Textarea
          label="Cover Letter (Optional)"
          placeholder="Briefly explain why you're a good fit for this role..."
          {...register('coverLetter')}
          error={errors.coverLetter?.message}
          rows={5}
        />
        
        <p className="text-[10px] text-muted-foreground">
          By submitting this application, your full profile (including contact info and machine skills) will be shared with the employer.
        </p>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
