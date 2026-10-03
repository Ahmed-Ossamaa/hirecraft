import React from 'react';
import { Company, Job } from '@/shared/api/generated/model';
import { MdLocationOn, MdBusiness, MdPeople, MdWork } from 'react-icons/md';
import Link from 'next/link';
import { formatTimeAgo } from '@/shared/lib/formatTimeAgo';

interface CompanyProfilePreviewProps {
  company: Company;
  jobs?: Job[];
  hideTopMargin?: boolean;
}

export const CompanyProfilePreview: React.FC<CompanyProfilePreviewProps> = ({ 
  company, 
  jobs = [], 
  hideTopMargin = false 
}) => {
  return (
    <div className={`bg-background pb-20 ${hideTopMargin ? '' : 'min-h-screen'}`}>
      {/* Cover Image */}
      <div className="bg-primary/5 border-b border-border h-48 md:h-64 relative overflow-hidden flex items-center justify-center">
        {company.coverUrl ? (
          <img src={company.coverUrl} alt={`${company.name} Cover`} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border-4 border-card shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={`${company.name} Logo`} className="w-full h-full object-contain p-2" />
              ) : (
                <MdBusiness className="text-5xl text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 space-y-4 pt-2 md:pt-4">
              <div>
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-2">
                  {company.name}
                </h1>
                {company.industry && (
                  <p className="text-lg text-primary font-medium mt-1">
                    {company.industry}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {company.location && (
                  <div className="flex items-center gap-1.5">
                    <MdLocationOn className="text-lg" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-1.5">
                    <MdPeople className="text-lg" />
                    <span>{company.size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {company.description && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg mb-3">About Us</h3>
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-5">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {company.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Open Positions */}
        {jobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-semibold text-foreground">
                Open Positions
              </h2>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {jobs.length} Job{jobs.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {jobs.map(job => (
                <Link 
                  key={job.id} 
                  href={`/jobs/${job.id}`}
                  className="block bg-card rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all p-5"
                >
                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MdWork className="text-base" />
                          <span className="capitalize">{job.jobType?.toLowerCase().replace('_', ' ')}</span>
                        </div>
                        {job.country && (
                          <div className="flex items-center gap-1.5">
                            <MdLocationOn className="text-base" />
                            <span>{job.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Posted {formatTimeAgo(job.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
