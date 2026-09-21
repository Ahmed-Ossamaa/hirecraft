"use client";

import { useState } from 'react';
import { JobCard, Job } from './JobCard';
import { Button } from '@/shared/components/ui/Button';

// dummy data (will use real data later)
export const DUMMY_JOBS: Job[] = [
  {
    id: '1',
    category: 'cnc',
    rate: 48,
    company: 'AeroPrecision Dynamics',
    location: 'Detroit, MI, United States',
    experience: '5+ Yrs Master',
    title: 'Lead 5-Axis CNC Mill Machinist',
    machine: 'DMG MORI DMU 50 (5-Axis)',
    tags: ['Titanium Milling', 'Heidenhain TNC 640', 'AS9100 Rev D'],
    salaryRange: '$85k - $110k',
    icon: 'adjust'
  },
  {
    id: '2',
    category: 'cnc',
    rate: 42,
    company: 'Vanguard Precision Tooling',
    location: 'Stuttgart, Germany',
    experience: '3+ Yrs Mid-Senior',
    title: 'Senior CNC Lathe & Turn-Mill Operator',
    machine: 'Mazak Integrex Dual-Spindle',
    tags: ['Live Tooling', 'Sub-Spindle Sync', 'Mazatrol SmoothX'],
    salaryRange: '€62k - €78k',
    salarySuffix: '/ yr',
    icon: 'settings_suggest'
  },
  {
    id: '3',
    category: 'robotics',
    rate: 40,
    company: 'Kuka Industrial Cell Systems',
    location: 'Greenville, SC, United States',
    experience: '4+ Yrs Automation',
    title: 'Industrial Automation & PLC Technician',
    machine: 'Siemens S7-1500 & Fanuc Robotic Cell',
    tags: ['Fanuc Robotics', 'Hydraulic Diagnostics', 'Safety PLC'],
    salaryRange: '$78k - $94k',
    salarySuffix: '/ yr',
    icon: 'smart_toy'
  },
  {
    id: '4',
    category: 'metal',
    rate: 55,
    company: 'Orbital Marine & Space Ateliers',
    location: 'Seattle, WA, United States',
    experience: '6+ Yrs ASME IX',
    title: 'Master TIG & Orbital Welder (Aerospace)',
    machine: 'Miller Dynapath & Orbital Head',
    tags: ['Inconel 718', 'X-Ray Weld Grade', 'Argon Purge Chamber'],
    salaryRange: '$90k - $125k',
    salarySuffix: '/ yr',
    icon: 'mode_heat'
  },
  {
    id: '5',
    category: 'quality',
    rate: 38,
    company: 'Hexagon Metrology Atelier',
    location: 'Chicago, IL, United States',
    experience: '3+ Yrs Metrology',
    title: 'CMM Quality Inspection Specialist',
    machine: 'Zeiss PRISMO / Calypso 3D',
    tags: ['Calypso Software', 'GD&T Tolerancing', 'First Article Inspection'],
    salaryRange: '$70k - $88k',
    salarySuffix: '/ yr',
    icon: 'straighten'
  },
  {
    id: '6',
    category: 'maintenance',
    rate: 36,
    company: 'Precision Die & Mold Works',
    location: 'Cleveland, OH, United States',
    experience: '2+ Yrs Electro-Mech',
    title: 'Production Machine Maintenance Tech',
    machine: 'Hydraulic Presses & Makino Wire EDM',
    tags: ['Preventive PM', 'Wire EDM Setup', 'Hydraulic Spool Valves'],
    salaryRange: '$65k - $82k',
    salarySuffix: '/ yr',
    icon: 'construction'
  }
];

type SortOption = 'recent' | 'rate' | 'tier' | 'urgent';

export function JobFeedSection() {
  const [activeSort, setActiveSort] = useState<SortOption>('recent');

  const getSortClass = (sort: SortOption) => {
    if (activeSort === sort) {
      return "sort-tab px-space-md py-space-2xs rounded font-label-technical text-label-technical bg-card-hover text-primary border border-primary/40 shadow-sm transition-colors cursor-pointer";
    }
    return "sort-tab px-space-md py-space-2xs rounded font-label-technical text-label-technical text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent";
  };

  const sortedJobs = [...DUMMY_JOBS].sort((a, b) => {
    if (activeSort === 'rate') return b.rate - a.rate;
    return 0; 
  });

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
          <div className="inline-flex rounded-lg bg-card p-1 border border-border self-start md:self-auto relative transition-all">
            <Button 
              variant="ghost"
              className={getSortClass('recent')} 
              onClick={() => setActiveSort('recent')}
            >
              Most Recent
            </Button>
            <Button 
              variant="ghost"
              className={getSortClass('rate')} 
              onClick={() => setActiveSort('rate')}
            >
              Highest Rate
            </Button>
            <Button 
              variant="ghost"
              className={getSortClass('tier')} 
              onClick={() => setActiveSort('tier')}
            >
              Master Grade
            </Button>
            <Button 
              variant="ghost"
              className={getSortClass('urgent')} 
              onClick={() => setActiveSort('urgent')}
            >
              Urgent Placement
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-gutter-desktop md:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
