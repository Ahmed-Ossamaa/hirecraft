import { Metadata } from 'next';
import { MembersList } from '@/features/companies/components/MembersList';
import { MdGroup } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Team Members | Technically',
  description: 'Manage your company team members.',
};

export default function CompanyMembersPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdGroup className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Team Members
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage who has access to your company dashboard.
          </p>
        </div>
      </div>

      <MembersList />
    </div>
  );
}
