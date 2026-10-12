import {
  MdCheckCircle,
  MdArrowForward,
  MdTaskAlt,
  MdEngineering,
  MdFactory,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export function DualCTASection() {
  return (
    <section className="w-full border-t border-border/60 bg-cta-section py-space-3xl">
      <div className="mx-auto max-w-360 px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter-desktop lg:grid-cols-2">
          {/* Operator */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-cta-card-border bg-cta-operator-card p-space-2xl shadow-lg shadow-blue-950/20 dark:shadow-slate-400/20">
            <div className="pointer-events-none  absolute inset-y-0 right-0  w-full sm:w-[65%] lg:w-[70%] xl:w-[75%]">
              <Image
                src="/images/operator.webp"
                alt="Industrial machine operator wearing safety equipment"
                fill
                sizes="(max-width: 1024px) 45vw, 25vw, 10vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-linear-to-r from-cta-operator-card via-cta-operator-card/40 to-transparent" />
            </div>

            <div className="relative z-10 flex max-w-[78%] sm:max-w-[68%] flex-col gap-space-md">
              <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-space-md py-space-2xs font-label-spec text-label-spec font-semibold uppercase tracking-wider text-primary">
                For Machine Specialists &amp; Operators
              </span>

              <h3 className="max-w-[85%] font-headline-lg text-headline-lg font-medium text-foreground">
                Create your Operator Profile
              </h3>

              <p className="max-w-[75%] font-body-md text-body-md leading-relaxed text-muted-foreground bg-card/40 rounded-lg p-1">
                Showcase the machines you run and your experience. Get direct
                offers from local manufacturing plants.
              </p>

              <ul className="flex flex-col gap-space-sm pt-space-xs">
                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    Clear wage and shift information
                  </span>
                </li>

                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    Highlight your specific machine experience
                  </span>
                </li>

                <li className="flex items-center gap-space-xs">
                  <MdCheckCircle className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    Track your applications status
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 w-fit pt-space-xl">
              <Link href="/auth?mode=register" className="inline-block">
                <Button
                  className="px-space-xl py-space-md shadow-lg shadow-blue-950/20 active:translate-y-0.5 dark:shadow-black/30"
                  rightIcon={<MdArrowForward className="text-[18px]" />}
                >
                  <span className="font-label-technical text-label-technical font-semibold uppercase tracking-wider">
                    Build Operator Profile
                  </span>
                </Button>
              </Link>
            </div>

            {/* skill badge */}
            <div className="pointer-events-none absolute bottom-[24%] right-3 z-10 hidden items-center justify-center rounded-xl border border-cta-card-border bg-card/95 p-3 text-primary shadow-lg backdrop-blur-sm sm:flex md:right-5">
              <MdEngineering className="text-2xl text-primary" />
            </div>
          </div>

          {/* Employer */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-cta-card-border bg-cta-employer-card p-space-2xl shadow-lg shadow-blue-950/20 dark:shadow-slate-400/20">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[65%] lg:w-[70%] xl:w-[75%]">
              <Image
                src="/images/manufacturing.webp"
                alt="Modern industrial manufacturing plant"
                fill
                sizes="(max-width: 1024px) 55vw, 30vw"
                className="object-cover object-center"
              />

              <div className="absolute inset-0 bg-linear-to-r from-cta-employer-card via-cta-employer-card/40 to-transparent" />
            </div>

            <div className="relative z-10 flex max-w-[68%] flex-col gap-space-md">
              {" "}
              <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-space-md py-space-2xs font-label-spec text-label-spec font-semibold uppercase tracking-wider text-primary">
                For Industrial Plants
              </span>
              <h3 className="max-w-[85%] font-headline-lg text-headline-lg font-medium text-foreground">
                Find skilled operators fast
              </h3>
              <p className="max-w-[75%] font-body-md text-body-md leading-relaxed text-muted-foreground bg-card/40 rounded-lg p-1">
                Connect directly with skilled operators ready to work on your
                production lines.
              </p>
              <ul className="flex flex-col gap-space-sm pt-space-xs">
                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    High retention rates for long-term hires
                  </span>
                </li>

                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    Experienced operators with practical skills
                  </span>
                </li>

                <li className="flex items-center gap-space-xs">
                  <MdTaskAlt className="shrink-0 text-[20px] text-primary" />
                  <span className="font-body-md text-body-md text-foreground">
                    Post a job quickly and easily
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative z-10 w-fit pt-space-xl">
              <Link href="/auth?mode=register" className="inline-block">
                <Button
                  variant="secondary"
                  className="border border-primary/50 px-space-xl py-space-md hover:border-primary hover:bg-primary/5 active:translate-y-0.5 dark:border-sky-700 dark:hover:border-sky-400 dark:hover:bg-sky-400/10"
                  rightIcon={<MdEngineering className="text-[18px]" />}
                >
                  <span className="font-label-technical text-label-technical font-semibold uppercase tracking-wider">
                    Hire Machine Operators
                  </span>
                </Button>
              </Link>
            </div>

            {/* factory badge */}
            <div className="pointer-events-none absolute bottom-[24%] right-3 z-10 hidden items-center justify-center rounded-xl border border-cta-card-border bg-card/95 p-3 text-primary shadow-lg backdrop-blur-sm sm:flex md:right-5">
              <MdFactory className="text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
