import React from 'react';
import { Metadata } from 'next';
import { fetchServer } from '@/shared/lib/ssr-fetch';
import { Company, Job } from '@/shared/api/generated/model';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { CompanyProfilePreview } from '@/features/companies/components/CompanyProfilePreview';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-50">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 bg-background  px-3 py-1.5 rounded-full border border-border transition-colors">
          <MdArrowBack /> Dashboard
        </Link>
      </div>
      <CompanyProfilePreview company={company} jobs={jobs} hideTopMargin={true} />
    </div>
  );
}
