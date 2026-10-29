import { Metadata } from "next";
import Link from "next/link";
import { MdSecurity, MdArrowBack } from "react-icons/md";

export const metadata: Metadata = {
  title: "Privacy Policy | Technically",
  description:
    "Learn how Technically collects, protects, and manages personal data, machine qualifications, and company information.",
  openGraph: {
    title: "Privacy Policy | Technically",
    description:
      "Transparency regarding data collection, privacy, and security practices across Technically.",
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

export default function PrivacyPolicyPage() {
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
            <MdSecurity className="text-sm" />
            Compliance &amp; Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: October 27, 2026 &bull; Last Updated: October 2026
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="w-full py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Quick Table of Contents (Desktop Sticky) */}
          <aside className="hidden md:block md:col-span-4">
            <div className="sticky top-28 space-y-3 p-4 rounded-xl border border-border/60 bg-card/40">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Table of Contents
              </span>
              <nav className="flex flex-col space-y-2 text-xs">
                <a href="#overview" className="text-muted-foreground hover:text-primary transition-colors">
                  1. Overview &amp; Scope
                </a>
                <a href="#data-collection" className="text-muted-foreground hover:text-primary transition-colors">
                  2. Information We Collect
                </a>
                <a href="#usage" className="text-muted-foreground hover:text-primary transition-colors">
                  3. How We Use Data
                </a>
                <a href="#sharing" className="text-muted-foreground hover:text-primary transition-colors">
                  4. Sharing &amp; Third Parties
                </a>
                <a href="#cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  5. Cookies &amp; Storage
                </a>
                <a href="#retention-security" className="text-muted-foreground hover:text-primary transition-colors">
                  6. Retention &amp; Security
                </a>
                <a href="#your-rights" className="text-muted-foreground hover:text-primary transition-colors">
                  7. Your Rights &amp; Choices
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  8. Contact &amp; Inquiries
                </a>
              </nav>
            </div>
          </aside>

          {/* Legal Prose Content */}
          <article className="md:col-span-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            <section id="overview" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                1. Overview &amp; Scope
              </h2>
              <p>
                Technically (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a specialized online job matching platform dedicated to connecting machine operators, CNC machinists, and industrial technicians with manufacturing plants.
              </p>
              <p>
                This Privacy Policy explains how we collect, store, process, and protect your personal information when you visit our website, register an account, post job openings, or submit job applications.
              </p>
            </section>

            <section id="data-collection" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                2. Information We Collect
              </h2>
              <p>We collect information directly from you and automatically through your use of the platform:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account Information:</strong> Name, email address, password hash, user role (Candidate or Employer), and contact details.
                </li>
                <li>
                  <strong className="text-foreground">Operator Profiles:</strong> Work history, certifications, machine tool proficiencies (e.g., CNC 3-axis/5-axis, lathe, grinder), controller familiarity, location preferences, and uploaded resumes.
                </li>
                <li>
                  <strong className="text-foreground">Employer &amp; Plant Information:</strong> Company name, plant locations, industry sector, job descriptions, compensation ranges, and team member accounts.
                </li>
                <li>
                  <strong className="text-foreground">Billing Data:</strong> When an employer subscribes to a hiring plan, payment processing is handled securely by our third-party payment partner (Stripe). Technically does not store credit card numbers or sensitive financial data on its servers.
                </li>
                <li>
                  <strong className="text-foreground">Technical Logs:</strong> IP address, browser type, device information, and interaction logs for security and performance optimization.
                </li>
              </ul>
            </section>

            <section id="usage" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                3. How We Use Your Information
              </h2>
              <p>Your information is used strictly to deliver and improve our services, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Facilitating job discovery, applicant tracking, and direct employer-candidate connections.</li>
                <li>Verifying user accounts and preventing fraudulent or duplicate job postings.</li>
                <li>Processing subscription transactions and managing plan allocations.</li>
                <li>Sending critical account notifications, application updates, and security alerts.</li>
                <li>Maintaining network security, troubleshooting errors, and optimizing platform performance.</li>
              </ul>
            </section>

            <section id="sharing" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                4. Data Sharing &amp; Third Parties
              </h2>
              <p>
                We do not sell, rent, or trade your personal information to third-party data brokers or marketing agencies. Information is shared only in the following contexts:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Between Employers and Applicants:</strong> When an operator applies to a job, their profile information and resume are shared directly with the posting company.
                </li>
                <li>
                  <strong className="text-foreground">Service Providers:</strong> Trusted third-party partners providing payment infrastructure (Stripe), email delivery, and cloud hosting. These providers are bound by strict confidentiality agreements.
                </li>
                <li>
                  <strong className="text-foreground">Legal Requirements:</strong> If compelled by applicable law, regulation, subpoena, or lawful government request.
                </li>
              </ul>
            </section>

            <section id="cookies" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                5. Cookies &amp; Storage
              </h2>
              <p>
                Technically utilizes essential cookies and local storage tokens to maintain authenticated sessions, secure API requests, and preserve your interface preferences (such as Dark/Light theme).
              </p>
              <p>
                You may configure your browser to reject cookies; however, essential cookies are required for authentication and core dashboard functionality.
              </p>
            </section>

            <section id="retention-security" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                6. Data Retention &amp; Security
              </h2>
              <p>
                We implement industry-standard administrative, physical, and technical safeguards (including HTTPS/TLS encryption in transit and encrypted storage at rest) to protect your personal data from unauthorized access, alteration, or disclosure.
              </p>
              <p>
                We retain your account information for as long as your account is active, or as needed to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section id="your-rights" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                7. Your Rights &amp; Choices
              </h2>
              <p>Depending on your jurisdiction, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access, review, and update your personal profile information at any time via your dashboard settings.</li>
                <li>Request the deletion of your account and associated personal data.</li>
              </ul>
            </section>

            <section id="contact" className="space-y-3">
              <h2 className="text-xl font-headline font-bold text-foreground">
                8. Contact &amp; Inquiries
              </h2>
              <p>
                If you have questions, privacy concerns, or wish to exercise your data rights, please contact our team:
              </p>
              <p className="p-4 rounded-lg bg-card border border-border/60 text-xs sm:text-sm font-mono">
                Email: <Link href="mailto:legal@technically.com" className="text-primary hover:underline font-mono">legal@technically.com</Link>
                <br />
                General Contact: <Link href="/contact" className="text-primary hover:underline">technically.com/contact</Link>
              </p>
            </section>
          </article>
        </div>
      </section>
    </div>
  );
}
