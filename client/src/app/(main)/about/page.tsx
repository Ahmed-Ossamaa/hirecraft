import { Metadata } from "next";
import Link from "next/link";
import {
  MdEngineering,
  MdFactory,
  MdPrecisionManufacturing,
  MdVerified,
  MdArrowForward,
  MdCheckCircle,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | Technically",
  description:
    "Technically is the specialized platform connecting skilled machine operators, CNC machinists, and technicians with precision manufacturing plants.",
  openGraph: {
    title: "About Us | Technically",
    description:
      "Connecting skilled machine operators with local manufacturing plants. Precision hiring built for industry.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* Hero Intro */}
      <section className="w-full border-b border-border/60 py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
            <MdPrecisionManufacturing className="text-sm" />
            Built for Modern Industry
          </div>
          <h1 className="text-3xl sm:text-5xl font-headline font-bold text-foreground tracking-tight max-w-3xl mx-auto leading-tight">
            Bridging the Gap Between Precision Operators and Modern Manufacturing
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            General job boards don’t understand CNC milling tolerances, multi-axis lathes, or tooling setups. Technically was built from the ground up for the trades and industrial production.
          </p>
        </div>
      </section>

      {/* The Mission & Story */}
      <section className="w-full py-12 md:py-16 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                Our Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
                Putting Operator Craftsmanship Front and Center
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Manufacturing facilities run on skilled people. When a precision CNC machine sits idle, entire supply chains slow down. Yet operators have historically had to sift through generic office job sites with vague job descriptions and no machine context.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Technically replaces the guesswork. We provide a tailored platform where operators highlight the exact machines, controllers, and equipment they excel at, and plant managers find verified talent ready to step onto the factory floor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-card border border-border/60 space-y-2">
                <span className="text-2xl font-bold font-mono text-primary">100%</span>
                <h3 className="text-sm font-semibold text-foreground">Industry-Focused</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dedicated strictly to machining, tooling, and industrial production trades.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/60 space-y-2">
                <span className="text-2xl font-bold font-mono text-primary">0$</span>
                <h3 className="text-sm font-semibold text-foreground">Free for Candidates</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Job seekers never pay to search, build an operator profile, or apply.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/60 space-y-2">
                <span className="text-2xl font-bold font-mono text-primary">Exact</span>
                <h3 className="text-sm font-semibold text-foreground">Machine Matching</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Filter by Haas, Fanuc, Mazak, DMG Mori, Siemens, and specialized controllers.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/60 space-y-2">
                <span className="text-2xl font-bold font-mono text-primary">Clear</span>
                <h3 className="text-sm font-semibold text-foreground">Compensation Data</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transparent wage ranges, plant details, and job expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="w-full py-12 md:py-16 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
              What We Stand For
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
              Principles Behind the Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MdEngineering className="text-xl" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Respect for Skilled Trades</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Precision manufacturing requires deep mechanical expertise, math acumen, and safety discipline. We design every feature with the respect operators deserve.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MdFactory className="text-xl" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Plant Operational Speed</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Plant managers don’t have time to review hundreds of unqualified resumes. We streamline candidate evaluation so machines stay running.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MdVerified className="text-xl" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Clarity & Trust</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                No concealed wages or ghost listings. We prioritize verified plant locations, clear equipment requirements, and direct communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Sided Platform Summary */}
      <section className="w-full py-12 md:py-16 border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Operators */}
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
                  For Machine Operators
                </span>
                <h3 className="text-xl font-headline font-bold text-foreground">
                  Showcase Your True Machine Experience
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create a profile highlighting your machine proficiencies (CNC Mills, Lathes, EDM, Grinding, Stamping), equipment background, and certifications. Apply directly to hiring plants.
                </p>
                <ul className="space-y-2 pt-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-primary text-base shrink-0" />
                    <span>Direct placement with zero agency middlemen</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-primary text-base shrink-0" />
                    <span>Always 100% free for workers</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link href="/jobs" className="inline-block">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    rightIcon={<MdArrowForward className="text-base" />}
                  >
                    Browse Open Jobs
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Plants */}
            <div className="p-6 md:p-8 rounded-xl bg-card border border-border/60 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
                  For Manufacturing Plants
                </span>
                <h3 className="text-xl font-headline font-bold text-foreground">
                  Fill Production Roles with Qualified Operators
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Post targeted job listings with specific CNC controllers and tooling needs. Review applicant machine backgrounds and manage your candidate pipeline effectively.
                </p>
                <ul className="space-y-2 pt-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-primary text-base shrink-0" />
                    <span>Transparent pricing with no surprise hiring commissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-primary text-base shrink-0" />
                    <span>Team collaboration and application status tracking</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link href="/pricing" className="inline-block">
                  <Button
                    className="cursor-pointer"
                    rightIcon={<MdArrowForward className="text-base" />}
                  >
                    View Hiring Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
            Ready to Connect with Manufacturing Plants and Operators?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Whether you run a production facility or operate complex machine tools, Technically is built for your success.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/jobs">
              <Button variant="outline" className="cursor-pointer">
                Find Work
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="cursor-pointer">
                Hire Operators
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
