"use client";

import React, { useRef } from 'react';
import { MdBusiness, MdUpload, MdDelete, MdImage } from 'react-icons/md';
import { useUploadLogo, useUploadCover, useRemoveLogo, useRemoveCover } from '@/shared/api/generated/companies/companies';
import { toast } from 'sonner';
import { getApiError } from '@/shared/utils/error';

interface CompanyImageUploadProps {
  type: 'logo' | 'cover';
  currentUrl?: string | null;
  onSuccess: (newUrl: string | null) => void;
}

export const CompanyImageUpload: React.FC<CompanyImageUploadProps> = ({ type, currentUrl, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadLogoMutation = useUploadLogo();
  const uploadCoverMutation = useUploadCover();
  const removeLogoMutation = useRemoveLogo();
  const removeCoverMutation = useRemoveCover();
  
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
      if (type === 'logo') {
        const res = await uploadLogoMutation.mutateAsync({ data: { image: file as any } });
        onSuccess(res.data?.logoUrl || null);
        toast.success('Logo uploaded successfully');
      } else {
        const res = await uploadCoverMutation.mutateAsync({ data: { image: file as any } });
        onSuccess(res.data?.coverUrl || null);
        toast.success('Cover uploaded successfully');
      }
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      toast.error(getApiError(error, `Failed to upload ${type}`));
    }
  };

  const handleRemove = async () => {
    try {
      if (type === 'logo') {
        await removeLogoMutation.mutateAsync();
        onSuccess(null);
        toast.success('Logo removed successfully');
      } else {
        await removeCoverMutation.mutateAsync();
        onSuccess(null);
        toast.success('Cover removed successfully');
      }
    } catch (error) {
      console.error(`Failed to remove ${type}:`, error);
      toast.error(getApiError(error, `Failed to remove ${type}`));
    }
  };

  const isUploading = type === 'logo' ? uploadLogoMutation.isPending : uploadCoverMutation.isPending;
  const isRemoving = type === 'logo' ? removeLogoMutation.isPending : removeCoverMutation.isPending;
  const disabled = isUploading || isRemoving;

  if (type === 'cover') {
    return (
      <div className="mb-6 relative group">
        <label className="block text-sm font-medium text-foreground mb-2">Company Cover</label>
        <div className="w-full h-48 rounded-xl bg-input border-2 border-dashed border-border overflow-hidden flex items-center justify-center text-muted-foreground relative">
          {currentUrl ? (
            <img src={currentUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <MdImage className="text-4xl mb-2" />
              <span className="text-sm">Upload Cover Image</span>
            </div>
          )}
          
          <div 
            className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center cursor-pointer ${currentUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hover:opacity-100'}`}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <MdUpload className="text-white text-3xl" />
          </div>
        </div>
        
        {currentUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-9 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
            title="Remove cover"
          >
            <MdDelete className="text-sm" />
          </button>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Logo upload
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-2">Company Logo</label>
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-input border-2 border-border overflow-hidden flex items-center justify-center text-muted-foreground shrink-0 relative">
            {currentUrl ? (
              <img src={currentUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <MdBusiness className="text-4xl" />
            )}
            
            <div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <MdUpload className="text-white text-2xl" />
            </div>
          </div>
          
          {currentUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              title="Remove logo"
            >
              <MdDelete className="text-xs" />
            </button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Upload your company logo.</p>
          <p className="text-xs mt-1">Recommended size: 256x256px.</p>
          <p className="text-xs">Max size: 5MB.</p>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
    </div>
  );
};
