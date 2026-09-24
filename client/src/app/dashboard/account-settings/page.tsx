"use client";

import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';

export default function AccountSettingsPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your security preferences and account settings.
          </p>
      </div>

      <div className="pt-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
