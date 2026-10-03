import { Metadata } from 'next';
import { fetchServer } from '@/shared/lib/ssr-fetch';
import { Company } from '@/shared/api/generated/model';
import { CompanyDashboardClient } from './CompanyDashboardClient';

export const metadata: Metadata = {
  title: 'Company Settings | Technically',
  description: 'Manage your company profile and details.',
};

export default async function CompanyPage() {
  const companyRes = await fetchServer<{ data: Company }>('/api/v1/companies/me');
  const company = companyRes?.data;

  if (!company) {
    return (
      <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
          <p className="text-red-500 mb-2">Failed to load company profile.</p>
          <p className="text-sm text-muted-foreground">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return <CompanyDashboardClient company={company} />;
}
