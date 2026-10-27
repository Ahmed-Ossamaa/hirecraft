import { Metadata } from "next";
import Link from "next/link";
import {
  MdHelpOutline,
  MdMailOutline,
  MdEngineering,
  MdFactory,
  MdPayment,
  MdExpandMore,
} from "react-icons/md";
import { FAQ_DATA, FaqItem } from "@/features/faq/components/FaqItems";
import { Button } from "@/shared/components/ui/Button";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Technically",
  description:
    "Find answers to common questions about candidate profiles, machine matching, plant job listings, pricing plans, and platform features.",
  openGraph: {
    title: "Frequently Asked Questions | Technically",
    description:
      "Answers to top questions for machine operators and industrial manufacturing plants.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

interface FaqSection {
  id: string;
  title: string;
  category: FaqItem["category"];
  icon: React.ReactNode;
}

const SECTIONS: FaqSection[] = [
  {
    id: "operators",
    title: "For Machine Operators",
    category: "candidates",
    icon: <MdEngineering className="text-lg" />,
  },
  {
    id: "plants",
    title: "For Manufacturing Plants",
    category: "employers",
    icon: <MdFactory className="text-lg" />,
  },
  {
    id: "billing",
    title: "Hiring Plans & Billing",
    category: "billing",
    icon: <MdPayment className="text-lg" />,
  },
  {
    id: "general",
    title: "Platform & Security",
    category: "general",
    icon: <MdHelpOutline className="text-lg" />,
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* Hero Header */}
      <section className="w-full border-b border-border/60 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
            <MdHelpOutline className="text-sm" />
            Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to know about navigating Technically—whether you are a machine specialist seeking opportunities or a manufacturing plant looking to hire operators.
          </p>

          {/* Quick jump anchor links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
              >
                {sec.icon}
                {sec.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections*/}
      <section className="w-full py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-12">
          {SECTIONS.map((section) => {
            const sectionItems = FAQ_DATA.filter(
              (item) => item.category === section.category
            );

            return (
              <div key={section.id} id={section.id} className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
                  <span className="text-primary">{section.icon}</span>
                  <h2 className="text-lg sm:text-xl font-headline font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {sectionItems.map((item) => (
                    <details
                      key={item.id}
                      className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-colors"
                      open={item.id === "cand-1" || item.id === "emp-1"}
                    >
                      <summary className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer hover:bg-card-hover/50 transition-colors list-none select-none">
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          {item.question}
                        </span>
                        <MdExpandMore className="text-lg text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
                      </summary>
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="w-full py-12 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="p-6 md:p-8 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Our support team is here to assist with plant onboarding, listings, and operator accounts.
              </p>
            </div>
            <Link href="/contact" className="shrink-0">
              <Button
                variant="outline"
                className="cursor-pointer"
                leftIcon={<MdMailOutline className="text-base" />}
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
