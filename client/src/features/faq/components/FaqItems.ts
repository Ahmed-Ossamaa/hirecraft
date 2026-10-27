export interface FaqItem {
  id: string;
  category: "candidates" | "employers" | "billing" | "general";
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: "cand-1",
    category: "candidates",
    question: "Is Technically free for machine operators and job seekers?",
    answer:
      "Yes, 100%. Creating an operator profile, highlighting machine proficiencies, browsing job listings, and submitting applications is completely free. We never charge job seekers or take cuts from wages.",
  },
  {
    id: "cand-2",
    category: "candidates",
    question: "Can I list specific CNC machines and controller models?",
    answer:
      "Absolutely. In your operator profile, you can specify machinery types (e.g., 3-Axis & 5-Axis Milling, CNC Lathes, Wire EDM, Swiss Machining) as well as familiar control units (Haas, Fanuc, Heidenhain, Siemens, Mazatrol).",
  },
  {
    id: "cand-3",
    category: "candidates",
    question: "What details are provided in job listings?",
    answer:
      "Every job post includes required machine proficiencies, tooling tolerances, location, and clear compensation details so you have full clarity before applying.",
  },
  {
    id: "cand-4",
    category: "candidates",
    question: "Do employers contact me directly?",
    answer:
      "Yes. When you submit an application, hiring managers and plant supervisors at the listing company receive your profile and resume directly through their dashboard to schedule interviews without third-party staffing middlemen.",
  },
  {
    id: "emp-1",
    category: "employers",
    question: "How do I post a job for my manufacturing plant?",
    answer:
      "Once you sign up with an Employer account and create your company profile, you can choose a hiring plan and publish jobs immediately. You can detail required machine types, tooling tolerances, facility requirements, and compensation.",
  },
  {
    id: "emp-2",
    category: "employers",
    question: "Can multiple team members manage applications together?",
    answer:
      "Yes. Company accounts allow you to invite production supervisors, HR coordinators, and plant managers to review incoming applications, update candidate statuses, and add internal notes.",
  },
  {
    id: "emp-3",
    category: "employers",
    question: "What does 'Simultaneous Active Jobs' mean?",
    answer:
      "Simultaneous active jobs represent how many distinct open job openings your plant can have published and receiving candidate applications concurrently. When a position is filled, you can archive it and post a new opening.",
  },
  {
    id: "emp-4",
    category: "employers",
    question: "Are there any placement fees or commissions when we hire?",
    answer:
      "None. Technically operates on transparent subscription plans with zero recruitment agency fees. You can hire as many qualified operators as you need from your active job listings without paying commission.",
  },
  {
    id: "bill-1",
    category: "billing",
    question: "Can I change or cancel my subscription at any time?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your plan at any time through your Company Billing dashboard. Upgrades take effect immediately, while cancellations take effect at the conclusion of the billing cycle.",
  },
  {
    id: "bill-2",
    category: "billing",
    question: "What payment methods are supported?",
    answer:
      "We process payments securely through Stripe. We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as corporate payment methods.",
  },
  {
    id: "bill-3",
    category: "billing",
    question: "How do annual billing discounts work?",
    answer:
      "Annual plans provide a discounted rate compared to monthly billing and grant your full yearly job posting allocation upfront so you can hire flexibly throughout the year.",
  },
  {
    id: "gen-1",
    category: "general",
    question: "What makes Technically different from generic job boards?",
    answer:
      "Generic job sites cater primarily to corporate and tech office jobs. Technically is purpose-built for the industrial shop floor—focusing on machine certifications, equipment proficiencies, tooling experience, and direct placement without staffing agency interference.",
  },
  {
    id: "gen-2",
    category: "general",
    question: "How is my personal and company data protected?",
    answer:
      "We use industry-standard encryption protocols (HTTPS/TLS) and secure database storage. We never sell personal data to third parties, and all payment transactions are tokenized via Stripe.",
  },
];
