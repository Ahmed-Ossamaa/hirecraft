"use client";

import { useState } from 'react';
import { useGetMyProfile } from '@/shared/api/generated/worker-profiles/worker-profiles';
import { ProfileForm } from '@/features/worker-profiles/components/ProfileForm';
import { MachineSkillsList } from '@/features/worker-profiles/components/MachineSkillsList';
import { BasicInfoForm } from '@/features/users/components/BasicInfoForm';
import { MdPerson, MdManageAccounts, MdBadge } from 'react-icons/md';
import { useAuthStore } from '@/shared/stores/auth-store';

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
    <div className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <MdPerson className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            My Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal information and technical machinery skills.
          </p>
        </div>
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
      </div>

      <div className="pt-2">
        {activeTab === 'basic' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BasicInfoForm user={user} />
          </div>
        )}

        {activeTab === 'professional' && (
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
