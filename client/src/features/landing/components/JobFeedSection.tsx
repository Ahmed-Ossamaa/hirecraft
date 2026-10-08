import { JobCard } from './JobCard';
import { Job } from '@/shared/api/generated/model/job';

interface JobFeedSectionProps {
  initialJobs: Job[];
}

export function JobFeedSection({ initialJobs }: JobFeedSectionProps) {
  return (
    <section className="w-full bg-background py-space-3xl">
      <div className="mx-auto max-w-360 px-margin-mobile lg:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-2xl">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-2xs">
              <span className="font-label-spec text-label-spec text-primary uppercase font-semibold">Latest Job Openings</span>
              <span className="h-1 w-8 bg-primary rounded-full"></span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-foreground font-medium">Latest Openings on the Factory Floor</h2>
            <p className="font-body-md text-body-md text-muted-foreground">
              Find jobs at local manufacturing plants and production lines.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-gutter-desktop md:grid-cols-2 lg:grid-cols-3">
          {initialJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
