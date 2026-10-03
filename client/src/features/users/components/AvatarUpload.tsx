"use client";

import React, { useRef } from 'react';
import { MdPerson, MdUpload, MdDelete } from 'react-icons/md';
import { useUploadAvatar, useRemoveAvatar, useGetProfile } from '@/shared/api/generated/users/users';
import { useAuthStore } from '@/shared/stores/auth-store';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui';
import { getApiError } from '@/shared/utils/error';

export const AvatarUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadAvatarMutation = useUploadAvatar();
  const removeAvatarMutation = useRemoveAvatar();
  
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const organizationId = useAuthStore((s) => s.organizationId);
  const companyRole = useAuthStore((s) => s.companyRole);
  const { refetch } = useGetProfile({ query: { enabled: false } });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync({
        data: { image: file as any },
      });
      toast.success('Avatar uploaded successfully');
      
      // Refetch profile to get the new avatar URL
      const res = await refetch();
      if (res.data?.data) {
        setAuth(res.data.data as any, organizationId, companyRole);
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(getApiError(error, 'Failed to upload avatar'));
    }
  };

  const handleRemove = async () => {
    try {
      await removeAvatarMutation.mutateAsync();
      toast.success('Avatar removed successfully');
      
      const res = await refetch();
      if (res.data?.data) {
        setAuth(res.data.data as any, organizationId, companyRole);
      }
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast.error(getApiError(error, 'Failed to remove avatar'));
    }
  };

  return (
    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border/50">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-input border-2 border-border overflow-hidden flex items-center justify-center text-muted-foreground shrink-0 relative">
          {user?.avatarURL ? (
            <img src={user.avatarURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <MdPerson className="text-4xl" />
          )}
          
          {/* Hover overlay for upload */}
          <div 
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <MdUpload className="text-white text-2xl" />
          </div>
        </div>
        
        {user?.avatarURL && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removeAvatarMutation.isPending}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            title="Remove avatar"
          >
            <MdDelete className="text-sm" />
          </button>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold text-foreground text-sm">Profile Picture</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          JPG or PNG. Max size of 5MB.
        </p>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        <div className="flex gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatarMutation.isPending}
            variant="outline"
          >
            {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload new photo'}
          </Button>
        </div>
      </div>
    </div>
  );
};
