"use client";

import { useState } from 'react';
import { useGetMyProfile } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { ProfileForm } from '@/features/worker-profiles/components/ProfileForm';
import { MachineSkillsList } from '@/features/worker-profiles/components/MachineSkillsList';
import { BasicInfoForm } from '@/features/users/components/BasicInfoForm';
import { MdManageAccounts, MdBadge, MdVisibility } from 'react-icons/md';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui';
import Link from 'next/link';

export default function WorkerProfilePage() {
  const { data: profileResponse, isLoading } = useGetMyProfile();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'basic' | 'professional'>('basic');

  const profile = profileResponse?.data || null;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 lg:p-10 w-full max-w-5xl mx-auto space-y-6">
        <div className="w-48 h-8 bg-card rounded-md animate-pulse"></div>
        <div className="w-full h-100 bg-card rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5!">
      <div className="flex justify-between items-start pb-2">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal information and technical machinery skills.
          </p>
        </div>
        {user?.userType === 'CANDIDATE' && profile?.id && (
          <Link href={`/worker/${profile.id}`}>
            <Button variant="outline" size="sm" leftIcon={<MdVisibility />}>
              Preview Public Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium cursor-pointer ${
            activeTab === 'basic'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <MdManageAccounts className="text-lg" />
          Basic Info
        </button>
        {user?.userType === 'CANDIDATE' && (
          <button
            onClick={() => setActiveTab('professional')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium cursor-pointer ${
              activeTab === 'professional'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <MdBadge className="text-lg" />
            Professional Profile
          </button>
        )}
      </div>

      <div className="pt-2">
        {activeTab === 'basic' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BasicInfoForm user={user} />
          </div>
        )}

        {user?.userType === 'CANDIDATE' && activeTab === 'professional' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ProfileForm initialData={profile} />
            
            <MachineSkillsList 
              skills={profile?.skills || []} 
              profileId={profile?.id} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
