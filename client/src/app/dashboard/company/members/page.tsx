import { Metadata } from 'next';
import { MembersList } from '@/features/companies/components/MembersList';

export const metadata: Metadata = {
  title: 'Team Members | Technically',
  description: 'Manage your company team members.',
};

export default function CompanyMembersPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <MembersList />
    </div>
  );
}
