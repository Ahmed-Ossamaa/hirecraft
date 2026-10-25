"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdWorkOutline,
  MdBookmarkBorder,
  MdBusiness,
  MdGroup,
  MdPostAdd,
  MdDashboard,
  MdWorkspacePremium,
} from "react-icons/md";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const candidateNav: NavItem[] = [
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: <MdWorkOutline className="text-lg" />,
  },
  {
    label: "Saved Jobs",
    href: "/dashboard/saved-jobs",
    icon: <MdBookmarkBorder className="text-lg" />,
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: <MdDashboard className="text-lg" />,
  },
];

export const employerNav: NavItem[] = [
  {
    label: "Company",
    href: "/dashboard/company",
    icon: <MdBusiness className="text-lg" />,
  },
  {
    label: "Job Postings",
    href: "/dashboard/company/jobs",
    icon: <MdPostAdd className="text-lg" />,
  },
  {
    label: "Team",
    href: "/dashboard/company/members",
    icon: <MdGroup className="text-lg" />,
  },
  {
    label: "Plans & Billing",
    href: "/dashboard/company/billing",
    icon: <MdWorkspacePremium className="text-lg" />,
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: <MdDashboard className="text-lg" />,
  },
];

interface SidebarNavProps {
  collapsed: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const navItems =
    user?.userType === UserUserType.EMPLOYER ? employerNav : candidateNav;

  const isActive = (href: string) => {
    if (href === "/jobs") return pathname === "/jobs";
    if (href === "/dashboard/company") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card-hover border border-transparent"
              }
              ${collapsed ? "justify-center px-0" : ""}
            `}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
