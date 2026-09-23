"use client";

import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { MdSettings } from 'react-icons/md';

export default function AccountSettingsPage() {
  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <MdSettings className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your security preferences and account settings.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
