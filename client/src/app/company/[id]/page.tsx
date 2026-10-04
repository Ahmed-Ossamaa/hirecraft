import { Metadata } from 'next';
import { fetchServer } from '@/shared/lib/ssr-fetch';
import { Company, Job } from '@/shared/api/generated/model';
import Link from 'next/link';
import { CompanyProfilePreview } from '@/features/companies/components/CompanyProfilePreview';
import { FloatingBackButton } from '@/shared/components/ui';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const res = await fetchServer<{ data: Company }>(`/api/v1/companies/${id}`);
  const company = res?.data;

  return {
    title: company ? `${company.name} | Technically` : 'Company Profile | Technically',
  };
}

export default async function CompanyPublicProfilePage(props: PageProps) {
  const { id } = await props.params;
  
  // Fetch company details and their public jobs
  const [companyRes, jobsRes] = await Promise.all([
    fetchServer<{ data: Company }>(`/api/v1/companies/${id}`),
    fetchServer<{ data: { data: Job[] } }>(`/api/v1/jobs?companyId=${id}&status=PUBLISHED&limit=10`),
  ]);
  
  const company = companyRes?.data;
  const jobs = jobsRes?.data?.data || [];

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-headline text-red-500">Company Not Found</h1>
          <p className="text-muted-foreground">The company profile you are looking for does not exist.</p>
          <Link href="/jobs" className="text-primary hover:underline font-medium block">
            Return to Job Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Back Button */}
      <FloatingBackButton />

      <CompanyProfilePreview company={company} jobs={jobs} hideTopMargin={true} />
    </div>
  );
}
