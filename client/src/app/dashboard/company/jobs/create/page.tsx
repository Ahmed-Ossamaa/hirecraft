import { Metadata } from 'next';
import { CreateJobForm } from '@/features/jobs/components/CreateJobForm';
import { MdAdd } from 'react-icons/md';

export const metadata: Metadata = {
  title: 'Post New Job | Technically',
  description: 'Create a new job posting.',
};

export default function CreateJobPage() {
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-4xl mx-auto space-y-6 mb-5">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdAdd className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Post New Job
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a new job posting to find the right machinist for your team.
          </p>
        </div>
      </div>

      <CreateJobForm />
    </div>
  );
}
