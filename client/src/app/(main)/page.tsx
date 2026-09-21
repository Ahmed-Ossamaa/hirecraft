import { HeroSection } from "@/features/landing/components/HeroSection";
import { JobFeedSection } from "@/features/landing/components/JobFeedSection";
import { DualCTASection } from "@/features/landing/components/DualCTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground selection:bg-primary selection:text-white">
      <HeroSection />

      {/* Metrics 'mock ai generted data for now' */}
      <section className="w-full bg-card-hover/60 border-b border-border/60 py-space-lg">
        <div className="mx-auto max-w-360 px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-2 gap-space-md md:grid-cols-4 md:divide-x md:divide-border/70">
            <div className="flex flex-col px-space-sm">
              <span className="font-label-spec text-label-spec uppercase text-muted-foreground">
                Average Operator Rate
              </span>
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md text-foreground font-medium">
                  $42.50
                </span>
                <span className="font-body-sm text-body-sm text-muted-foreground">
                  / hr baseline
                </span>
              </div>
            </div>
            <div className="flex flex-col px-space-sm">
              <span className="font-label-spec text-label-spec uppercase text-muted-foreground">
                Median Time to Offer
              </span>
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md text-primary font-medium">
                  6 Days
                </span>
                <span className="font-body-sm text-body-sm text-muted-foreground">
                  from application to offer
                </span>
              </div>
            </div>
            <div className="flex flex-col px-space-sm">
              <span className="font-label-spec text-label-spec uppercase text-muted-foreground">
                Skill Match Accuracy
              </span>
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md text-foreground font-medium">
                  99.2%
                </span>
                <span className="font-body-sm text-body-sm text-muted-foreground">
                  based on operator experience
                </span>
              </div>
            </div>
            <div className="flex flex-col px-space-sm">
              <span className="font-label-spec text-label-spec uppercase text-muted-foreground">
                Active Local Shops
              </span>
              <div className="flex items-baseline gap-space-2xs">
                <span className="font-headline-md text-headline-md text-foreground font-medium">
                  180+
                </span>
                <span className="font-body-sm text-body-sm text-muted-foreground">
                  actively hiring
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JobFeedSection />

      <DualCTASection />
    </div>
  );
}
