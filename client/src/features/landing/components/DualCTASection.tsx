import { MdCheckCircle, MdArrowForward, MdTaskAlt, MdEngineering } from 'react-icons/md';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';

export function DualCTASection() {
  return (
    <section className="w-full bg-background py-space-3xl border-t border-border/40">
      <div className="mx-auto max-w-360 px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter-desktop lg:grid-cols-2">
          
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-card p-space-2xl border border-border shadow-xl">
            <div className="flex flex-col gap-space-md">
              <span className="w-fit rounded-full bg-card-hover border border-border px-space-md py-space-2xs font-label-spec text-label-spec text-primary uppercase tracking-wider font-semibold">
                For Machine Specialists &amp; Operators
              </span>
              <h3 className="font-headline-lg text-headline-lg text-foreground font-medium">
                Create your Operator Profile
              </h3>
              <p className="font-body-md text-body-md text-muted-foreground leading-relaxed">
                Showcase the machines you run and your experience. Get direct offers from local manufacturing plants.
              </p>
              <ul className="flex flex-col gap-space-sm pt-space-xs">
                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">Clear wage and shift information</span>
                </li>
                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">Highlight your specific machine experience</span>
                </li>
                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">Track your applications status</span>
                </li>
              </ul>
            </div>
            <div className="pt-space-xl">
              <Link href="/auth?mode=register">
                <Button 
                  className="px-space-xl py-space-md shadow-lg shadow-sky-950/40 active:translate-y-0.5"
                  rightIcon={<MdArrowForward className="text-[18px]" />}
                >
                  <span className="font-label-technical text-label-technical uppercase tracking-wider font-semibold">Build Operator Profile</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-card-hover p-space-2xl text-foreground border border-border-light shadow-2xl">
            <div className="flex flex-col gap-space-md">
              <span className="w-fit rounded-full bg-primary/10 dark:bg-sky-950/60 border border-primary/20 dark:border-sky-800/60 px-space-md py-space-2xs font-label-spec text-label-spec text-primary uppercase tracking-wider font-semibold">
                For Industrial Plants
              </span>
              <h3 className="font-headline-lg text-headline-lg text-foreground font-medium">
                Find skilled operators fast
              </h3>
              <p className="font-body-md text-body-md text-muted-foreground leading-relaxed">
                Connect directly with skilled operators ready to work on your production lines.
              </p>
              <ul className="flex flex-col gap-space-sm pt-space-xs text-muted-foreground">
                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">High retention rates for long-term hires</span>
                </li>
                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">Experienced operators with practical skills</span>
                </li>
                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="text-primary text-[20px]" />
                  <span className="font-body-md text-body-md text-foreground">Post a job quickly and easily</span>
                </li>
              </ul>
            </div>
            <div className="pt-space-xl">
              <Link href="/auth?mode=register">
                <Button 
                  variant="secondary"
                  className="px-space-xl py-space-md active:translate-y-0.5 hover:border-primary/60"
                  rightIcon={<MdEngineering className="text-[18px]" />}
                >
                  <span className="font-label-technical text-label-technical uppercase tracking-wider font-semibold">Hire Machine Operators</span>
                </Button>
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
