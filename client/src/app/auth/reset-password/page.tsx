import React from 'react';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import Link from 'next/link';
import { MdSquareFoot } from 'react-icons/md';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link className="flex items-center gap-2 mb-8 group cursor-pointer" href="/">
        <div className="w-10 h-10 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary transition-transform group-hover:border-primary group-hover:scale-105 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <MdSquareFoot className="text-[22px]" />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-headline text-2xl text-foreground tracking-tight">Technically</span>
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
        </div>
      </Link>
      
      <div className="w-full flex justify-center">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
