import { Metadata } from "next";
import Link from "next/link";
import { MdGavel, MdArrowBack } from "react-icons/md";

export const metadata: Metadata = {
  title: "Terms of Service | Technically",
  description:
    "Review the terms, rules, and conditions governing the use of Technically for job seekers and hiring employers.",
  openGraph: {
    title: "Terms of Service | Technically",
    description:
      "Terms of Service governing the use of the Technically manufacturing job board platform.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col w-full bg-background text-foreground">
      {/* Header */}
      <section className="w-full border-b border-border/60 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer pr-5"
          >
            <MdArrowBack className="text-sm" />
            Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider">
            <MdGavel className="text-sm" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 27, 2026 &bull; Last Updated: October 2026
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="w-full py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/*Table of Contents */}
          <aside className="hidden md:block md:col-span-4">
            <div className="sticky top-28 space-y-3 p-4 rounded-xl border border-border/60 bg-card/40">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Table of Contents
              </span>
              <nav className="flex flex-col space-y-2 text-xs">
                <a href="#acceptance" className="text-muted-foreground hover:text-primary transition-colors">
                  1. Acceptance of Terms
                </a>
                <a href="#eligibility" className="text-muted-foreground hover:text-primary transition-colors">
                  2. Eligibility &amp; Accounts
                </a>
                <a href="#operator-rules" className="text-muted-foreground hover:text-primary transition-colors">
                  3. Candidate Responsibilities
                </a>
                <a href="#employer-rules" className="text-muted-foreground hover:text-primary transition-colors">
                  4. Employer Responsibilities
                </a>
                <a href="#billing" className="text-muted-foreground hover:text-primary transition-colors">
                  5. Subscriptions &amp; Billing
                </a>
                <a href="#prohibited" className="text-muted-foreground hover:text-primary transition-colors">
                  6. Prohibited Activities
                </a>
                <a href="#intellectual-property" className="text-muted-foreground hover:text-primary transition-colors">
                  7. Intellectual Property
                </a>
                <a href="#disclaimers" className="text-muted-foreground hover:text-primary transition-colors">
                  8. Disclaimers &amp; Liability
                </a>
                <a href="#termination" className="text-muted-foreground hover:text-primary transition-colors">
                  9. Termination
                </a>
                <a href="#contact-terms" className="text-muted-foreground hover:text-primary transition-colors">
                  10. Contact
                </a>
              </nav>
            </div>
          </aside>

          {/* Legal Prose Content */}
          <article className="md:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            <section id="acceptance" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Technically platform (&quot;Service&quot;), including any associated websites, subdomains, and applications, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service.
              </p>
              <p>
                These Terms apply to all visitors, registered candidates/operators, company administrators, and employers.
              </p>
            </section>

            <section id="eligibility" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                2. Eligibility &amp; Accounts
              </h2>
              <p>
                You must be at least 18 years of age and capable of entering into legally binding contracts to create an account. When registering:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You agree to provide true, accurate, current, and complete information.</li>
                <li>You are responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
                <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
              </ul>
            </section>

            <section id="operator-rules" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                3. Candidate &amp; Operator Responsibilities
              </h2>
              <p>
                Candidates use Technically to build operator profiles and apply for manufacturing positions. You agree that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All stated machinery experience, controller skills, and certifications reflect your genuine experience.</li>
                <li>Resumes, contact info, and employment preferences provided are accurate and up to date.</li>
                <li>Using the platform does not guarantee job placement or an employment offer from any third-party employer.</li>
              </ul>
            </section>

            <section id="employer-rules" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                4. Employer &amp; Company Responsibilities
              </h2>
              <p>
                Employers use Technically to list job openings and review candidates. Employers agree that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All job postings represent bona fide employment opportunities at actual manufacturing or industrial facilities.</li>
                <li>Job listings must clearly outline position requirements, equipment involved, and comply with all applicable local, state, and federal labor and wage regulations.</li>
                <li>Postings must not contain discriminatory hiring criteria, multi-level marketing solicitations, or deceptive descriptions.</li>
              </ul>
            </section>

            <section id="billing" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                5. Subscriptions, Credits &amp; Billing
              </h2>
              <p>
                Paid employer plans are billed on a recurring monthly or annual basis as specified during checkout.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Payment Processing:</strong> Transactions are handled by Stripe. You authorize us to charge your designated payment method for applicable subscription fees and taxes.
                </li>
                <li>
                  <strong className="text-foreground">Active Job Limits:</strong> Subscriptions grant a defined quota of simultaneous active job openings as specified in your plan.
                </li>
                <li>
                  <strong className="text-foreground">Cancellations:</strong> You can cancel your subscription at any time via your Company Billing dashboard. Cancellations take effect at the conclusion of your current billing period without retroactive refunds.
                </li>
              </ul>
            </section>

            <section id="prohibited" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                6. Prohibited Activities
              </h2>
              <p>When using Technically, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Scrape, crawl, or harvest data, job postings, or candidate profiles without express written authorization.</li>
                <li>Introduce malicious code, viruses, or interfere with platform availability.</li>
                <li>Impersonate any person, company, or manufacturing entity.</li>
                <li>Post spam, unsolicited commercial communications, or fraudulent listings.</li>
              </ul>
            </section>

            <section id="intellectual-property" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                7. Intellectual Property
              </h2>
              <p>
                The Technically platform, branding, logo, code, interfaces, and proprietary matching tools are owned by Technically and protected by applicable copyright and trademark laws.
              </p>
              <p>
                You retain ownership of any logos, resumes, or job descriptions you upload, but grant Technically a non-exclusive license to display them for the purpose of operating the platform.
              </p>
            </section>

            <section id="disclaimers" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                8. Disclaimers &amp; Limitation of Liability
              </h2>
              <p>
                Technically is provided &quot;as is&quot; without warranties of any kind, whether express or implied. We do not act as an employer, recruiter, or staffing agency. We are not responsible for any hiring decisions, workplace conditions, plant safety, or disputes between employers and workers.
              </p>
              <p>
                To the maximum extent permitted by law, Technically shall not be liable for any indirect, incidental, punitive, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section id="termination" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                9. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent behavior, or disrupt the integrity of the platform, with or without prior notice.
              </p>
            </section>

            <section id="contact-terms" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                10. Contact &amp; Questions
              </h2>
              <p>
                For questions regarding these Terms of Service, please reach out to:
              </p>
              <p className="p-4 rounded-lg bg-card border border-border/60 text-xs sm:text-sm font-mono">
                Email: <Link href="mailto:legal@technically.com" className="text-primary hover:underline font-mono">legal@technically.com</Link>
                <br />
                General Inquiries: <Link href="/contact" className="text-primary hover:underline">technically.com/contact</Link>
              </p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
