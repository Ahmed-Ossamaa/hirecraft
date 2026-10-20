import { Metadata } from 'next';
import { JobApplicantsView } from '@/features/jobs/components/JobApplicantsView';

export const metadata: Metadata = {
  title: 'Job Applicants | Technically',
  description: 'Review applicants for your job posting.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobApplicantsPage(props: PageProps) {
  const { id: jobId } = await props.params;

  return <JobApplicantsView jobId={jobId} />;
}
