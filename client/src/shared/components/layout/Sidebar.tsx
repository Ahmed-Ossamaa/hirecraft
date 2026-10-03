"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdPerson,
  MdWorkOutline,
  MdBusiness,
  MdGroup,
  MdPostAdd,
  MdDashboard,
  MdChevronLeft,
  MdChevronRight,
  MdSquareFoot,
  MdSettings,
} from "react-icons/md";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const candidateNav: NavItem[] = [
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <MdPerson className="text-lg" />,
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: <MdWorkOutline className="text-lg" />,
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: <MdDashboard className="text-lg" />,
  },
  {
    label: "Account Settings",
    href: "/dashboard/account-settings",
    icon: <MdSettings className="text-lg" />,
  },
];

const employerNav: NavItem[] = [
  {
    label: "Company",
    href: "/dashboard/company",
    icon: <MdBusiness className="text-lg" />,
  },
  {
    label: "Team",
    href: "/dashboard/company/members",
    icon: <MdGroup className="text-lg" />,
  },
  {
    label: "Job Postings",
    href: "/dashboard/company/jobs",
    icon: <MdPostAdd className="text-lg" />,
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: <MdDashboard className="text-lg" />,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <MdPerson className="text-lg" />,
  },
  {
    label: "Account Settings",
    href: "/dashboard/account-settings",
    icon: <MdSettings className="text-lg" />,
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const userType = user?.userType;
  const navItems =
    userType === UserUserType.EMPLOYER ? employerNav : candidateNav;

  const isActive = (href: string) => {
    if (href === "/jobs") return pathname === "/jobs";
    if (href === "/dashboard/company") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile backdrop when expanded */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col
          bg-card border-r border-border/60
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-17" : "w-60"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-space-xs px-4 border-b border-border/60 shrink-0">
          <Link href="/" className="flex items-center gap-space-xs group">
            <div className="w-9 h-9 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary transition-transform group-hover:border-primary group-hover:scale-105 shadow-sm shrink-0">
              <MdSquareFoot className="text-[20px]" />
            </div>
            {!collapsed && (
              <span className="font-headline-sm text-headline-sm text-foreground tracking-tight whitespace-nowrap">
                Technically
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
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
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border/60 p-3 shrink-0">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors text-sm cursor-pointer"
          >
            {collapsed ? (
              <MdChevronRight className="text-lg" />
            ) : (
              <>
                <MdChevronLeft className="text-lg" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
