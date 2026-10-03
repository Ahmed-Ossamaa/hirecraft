import { Metadata } from 'next';
import { fetchServer } from '@/shared/lib/ssr-fetch';
import { CompanyMember } from '@/shared/api/generated/model';
import { MembersList } from '@/features/companies/components/MembersList';
import { MdGroup } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Team Members | Technically',
  description: 'Manage your company team members.',
};

interface GetMembersResponse {
  data: CompanyMember[];
  total: number;
  page: number;
  totalPages: number;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompanyMembersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const status = (searchParams.status as string) || 'ACTIVE';

  const membersRes = await fetchServer<{ data: GetMembersResponse }>(`/api/v1/company-members?page=${page}&limit=10&status=${status}`);
  const res = membersRes?.data;
  const members = res?.data || [];
  const currentPage = res?.page || 1;
  const totalPages = res?.totalPages || 1;

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

      <MembersList 
        initialMembers={members} 
        currentPage={currentPage} 
        totalPages={totalPages} 
        currentStatus={status as "ACTIVE" | "PENDING" | "SUSPENDED"}
      />
    </div>
  );
}
