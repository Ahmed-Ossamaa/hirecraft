"use client";

import React, { useState } from 'react';
import { Company } from '@/shared/api/generated/model';
import { CompanyProfileForm } from '@/features/companies/components/CompanyProfileForm';
import { CompanyProfilePreview } from '@/features/companies/components/CompanyProfilePreview';
import { MdEdit, MdClose, MdVisibility, MdSettings } from 'react-icons/md';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/shared/stores/auth-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompanyDashboardClientProps {
  company: Company;
}

export const CompanyDashboardClient: React.FC<CompanyDashboardClientProps> = ({ company }) => {
  const [isEditing, setIsEditing] = useState(false);
  const user = useAuthStore(state => state.user);
  const companyRole = useAuthStore(state => state.companyRole);
  const isAdmin = companyRole === 'ADMIN';
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MdSettings className="text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
              Company Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your company details and public profile.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing && company.id && (
            <Link href={`/company/${company.id}`}>
              <Button variant="outline" size="sm" leftIcon={<MdVisibility />}>
                Public View
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Button
              variant={isEditing ? "outline" : "primary"}
              size="sm"
              leftIcon={isEditing ? <MdClose /> : <MdEdit />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="animate-in fade-in duration-300">
          <CompanyProfileForm initialData={company} onSuccess={() => { setIsEditing(false); router.refresh(); }} />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
          <CompanyProfilePreview company={company} hideTopMargin={false} />
        </div>
      )}
    </div>
  );
};
