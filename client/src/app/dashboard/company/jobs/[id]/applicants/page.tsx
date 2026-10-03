import { Metadata } from 'next';
import { fetchServer } from '@/shared/lib/ssr-fetch';
import { Job, JobApplication } from '@/shared/api/generated/model';
import { JobApplicantsView } from '@/features/jobs/components/JobApplicantsView';
import { MdPeople } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Job Applicants | Technically',
  description: 'Review applicants for your job posting.',
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface GetApplicationsResponse {
  data: JobApplication[];
  total: number;
  page: number;
  totalPages: number;
}

export default async function JobApplicantsPage(props: PageProps) {
  const { id: jobId } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  const [jobRes, applicationsRes] = await Promise.all([
    fetchServer<{ data: Job }>(`/api/v1/jobs/${jobId}`),
    fetchServer<{ data: GetApplicationsResponse }>(`/api/v1/applications/job/${jobId}?page=${page}&limit=10`),
  ]);

  const job = jobRes?.data;

  if (!job) {
    return (
      <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto">
        <p className="text-red-500">Job not found.</p>
      </div>
    );
  }

  const res = applicationsRes?.data;
  const applications = res?.data || [];
  const currentPage = res?.page || 1;
  const totalPages = res?.totalPages || 1;

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdPeople className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight line-clamp-1">
            Applicants: {job.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and manage candidates who applied for this role.
          </p>
        </div>
      </div>

      <JobApplicantsView 
        initialApplications={applications} 
        jobId={jobId} 
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
