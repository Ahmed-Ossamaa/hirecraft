"use client";

import Link from "next/link";
import {
  MdGroup,
  MdBusiness,
  MdWorkOutline,
  MdWorkspacePremium,
  MdShield,
  MdBarChart,
} from "react-icons/md";
import { AdminOverviewStats } from "@/features/admin/components/overview/AdminOverviewStats";

export default function AdminOverviewPage() {
  const quickActions = [
    {
      title: "User Management",
      description: "Search, filter by role, inspect accounts, and manage user bans.",
      href: "/dashboard/admin/users",
      icon: <MdGroup className="text-xl" />,
      tag: "Moderation",
    },
    {
      title: "Company Directory",
      description: "Explore registered companies, locations, industries, and active memberships.",
      href: "/dashboard/admin/companies",
      icon: <MdBusiness className="text-xl" />,
      tag: "Directory",
    },
    {
      title: "Job Moderation",
      description: "Review job postings, change publishing statuses, or hard delete expired jobs.",
      href: "/dashboard/admin/jobs",
      icon: <MdWorkOutline className="text-xl" />,
      tag: "Moderation",
    },
    {
      title: "Platform Subscriptions",
      description: "Track company subscription plans, payment providers, and active cycles.",
      href: "/dashboard/admin/billing",
      icon: <MdWorkspacePremium className="text-xl" />,
      tag: "Billing",
    },
    {
      title: "Platform Analytics",
      description: "Deep dive into time-series growth and revenue trends.",
      href: "/dashboard/admin/analytics",
      icon: <MdBarChart className="text-xl" />,
      tag: "Insights",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminOverviewStats />

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MdShield className="text-xl text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Administrative Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="p-5 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
                    {action.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1">
                Open Module &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

