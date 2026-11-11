"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { Select } from '@/shared/components/ui/Select';
import { useInviteMember } from '@/shared/api/generated/company-members/company-members';
import { toast } from 'sonner';
import { FormError } from '@/shared/components/ui/FormError';
import { getApiError } from '@/shared/utils/error';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name is required').max(50),
  lastName: z.string().min(2, 'Last name is required').max(50),
  role: z.enum(['ADMIN', 'HIRING_MANAGER', 'STAFF'] as const),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const inviteMutation = useInviteMember();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'HIRING_MANAGER',
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteMutation.mutateAsync({ data });
      toast.success("Invitation sent successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      setError('root', { type: 'manual', message: getApiError(error, 'Failed to send invitation.') });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={errors.root?.message} />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First Name *"
            {...register('firstName')} 
            placeholder="Ahmed" 
            error={errors.firstName?.message}
          />
          <Input 
            label="Last Name *"
            {...register('lastName')} 
            placeholder="Ossama" 
            error={errors.lastName?.message}
          />
        </div>

        <Input 
          label="Email Address *"
          {...register('email')} 
          placeholder="colleague@company.com" 
          type="email"
          error={errors.email?.message}
        />

        <Select
          label="Role *"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { label: 'Admin (Full Access)', value: 'ADMIN' },
            { label: 'Hiring Manager (Post Jobs)', value: 'HIRING_MANAGER' },
            { label: 'Staff (Read Only)', value: 'STAFF' },
          ]}
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
