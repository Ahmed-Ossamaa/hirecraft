import { Metadata } from "next";
import Link from "next/link";
import {
  MdMailOutline,
  MdSupportAgent,
  MdFactory,
  MdHelpOutline,
} from "react-icons/md";
import { ContactForm, CopyEmailButton } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Technically",
  description:
    "Get in touch with the Technically team for operator assistance, employer job posting inquiries, billing support, or general questions.",
  openGraph: {
    title: "Contact Us | Technically",
    description:
      "Contact Technically for machine operator support and manufacturing plant hiring assistance.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* Header */}
      <section className="w-full border-b border-border/60 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
            <MdMailOutline className="text-sm" />
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
            Contact the Technically Team
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have questions about candidate profiles, posting manufacturing jobs, or platform subscriptions? We are ready to help.
          </p>
        </div>
      </section>

      <section className="w-full py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Inquiries */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                Direct Channels
              </span>
              <h2 className="text-xl sm:text-2xl font-headline font-bold text-foreground">
                Reach the Right Department
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose the direct contact address for faster attention to your request.
              </p>
            </div>

            <div className="space-y-4">
              {/* Plant & Employer Support */}
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MdFactory className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Manufacturing Plants &amp; Hiring
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Job postings, employer subscriptions &amp; corporate plans
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <a
                    href="mailto:plants@technically.com"
                    className="text-primary hover:underline font-mono"
                  >
                    plants@technically.com
                  </a>
                  <CopyEmailButton email="plants@technically.com" />
                </div>
              </div>

              {/* Operator & Candidate Support */}
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MdSupportAgent className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Machine Operators &amp; Candidates
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Profiles, machine skills &amp; application assistance
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <a
                    href="mailto:operators@technically.com"
                    className="text-primary hover:underline font-mono"
                  >
                    operators@technically.com
                  </a>
                  <CopyEmailButton email="operators@technically.com" />
                </div>
              </div>

              {/* privacy Inquiries */}
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <MdMailOutline className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                       Legal Inquiries
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Partnerships, press  &amp; privacy
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <a
                    href="mailto:legal@technically.com"
                    className="text-primary hover:underline font-mono"
                  >
                    legal@technically.com
                  </a>
                  <CopyEmailButton email="legal@technically.com" />
                </div>
              </div>
            </div>

            {/* Quick FAQ notice */}
            <div className="p-4 rounded-xl bg-card/40 border border-border/60 flex items-start gap-3">
              <MdHelpOutline className="text-primary text-xl shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Looking for immediate answers?
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Most common inquiries regarding job credits, machine profiles, and cancellations are answered in our{" "}
                  <Link href="/faq" className="text-primary hover:underline font-medium">
                    FAQ page
                  </Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
