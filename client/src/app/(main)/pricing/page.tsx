import { Metadata } from "next";
import { PublicPricingGrid } from "@/features/billing/components/PublicPricingGrid";
import type { Plan } from "@/shared/api/generated/model";
import { MdHelpOutline, MdSecurity, MdSpeed, MdSupportAgent } from "react-icons/md";

export const metadata: Metadata = {
  title: "Pricing & Hiring Plans | Technically",
  description:
    "Flexible, transparent hiring plans for machine shops, production lines, and precision manufacturing. Hire CNC operators, machinists, and mechanics with confidence.",
  openGraph: {
    title: "Pricing & Hiring Plans | Technically",
    description:
      "Transparent hiring plans for industrial and manufacturing teams. Start free or scale with Pro.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

//(ISR)
export const revalidate = 3600; // revalidated hourly

export default async function PricingPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let plans: Plan[] = [];

  try {
    const res = await fetch(`${apiUrl}/api/v1/plans`, {
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    if (json?.data && Array.isArray(json.data)) {
      plans = json.data;
    }
  } catch (error) {
    console.error(
      "[Pricing Page] Failed to fetch plans",
      error instanceof Error ? error.name : "Unknown error",
    );
  }

  return (
    <div className="flex flex-col w-full bg-background text-foreground selection:bg-primary selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-160 h-96 bg-primary/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-10 md:py-15 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-headline font-bold text-foreground tracking-tight">
            Simple, Predictable Hiring Plans
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Scale your manufacturing team with specialized CNC machinists, precision operators, and technicians. No surprise fees. Cancel or change anytime.
          </p>
        </div>

        {/* Pricing Grid */}
        <PublicPricingGrid initialPlans={plans} />

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/60">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card/60 border border-border/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <MdSpeed className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Fast Operator Placement
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reach operators actively seeking manufacturing roles in your region.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card/60 border border-border/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <MdSecurity className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Secure & Encrypted Payments
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All subscriptions are processed securely through Stripe with 256-bit encryption. Technically never stores card details.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card/60 border border-border/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <MdSupportAgent className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Dedicated Support
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need customized limits, wire transfers, or dedicated onboarding? Our recruitment specialists are here to help.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <MdHelpOutline className="text-sm" /> Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
              Got Questions? We’ve Got Answers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-card/50 border border-border/60 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Can I change or cancel my plan at any time?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yes. You can upgrade, downgrade, or cancel your subscription directly from your Company Billing dashboard. Upgrades take effect immediately, while downgrades take effect at the end of your billing cycle.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card/50 border border-border/60 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                How do job posting credits work?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each job posting credit allows you to publish one active job to our specialized job board. Monthly plans refresh credits every 30 days, while annual plans grant full credits upfront.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card/50 border border-border/60 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                What does &quot;Simultaneous Active Jobs&quot; mean?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simultaneous active jobs represent how many distinct open job requisitions your team can have published and receiving candidate applications at the exact same moment.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card/50 border border-border/60 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Is Technically free for candidates and operators?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yes, 100%. Job seekers and operators never pay anything to create a profile, showcase machine certifications, or apply directly to manufacturing plants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
