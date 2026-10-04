import { Metadata } from 'next';
import { AcceptInviteForm } from '@/features/auth/components/AcceptInviteForm';
import { MdSquareFoot } from 'react-icons/md';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accept Invitation | Technically',
  description: 'Join your company on Technically.',
};

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-space-sm group">
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm transition-transform group-hover:scale-105 group-hover:border-primary">
              <MdSquareFoot className="text-[28px]" />
            </div>
            <span className="font-headline font-bold text-2xl text-foreground tracking-tight">
              Technically
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <AcceptInviteForm />
      </div>
    </div>
  );
}
