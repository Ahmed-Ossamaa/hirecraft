"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MdSettings } from "react-icons/md";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model";
import { SidebarProfileMenu } from "./SidebarProfileMenu";

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const pathname = usePathname();
  const { user, companyRole } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile menu on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  const roleDisplay = companyRole
    ? companyRole.replace(/_/g, " ").toLocaleLowerCase()
    : user?.userType === UserUserType.EMPLOYER
      ? "Employer"
      : "Candidate";

  return (
    <div
      ref={profileMenuRef}
      className="border-t border-border/60 p-2 shrink-0 relative"
    >
      {/* Popover Menu */}
      {isProfileMenuOpen && (
        <SidebarProfileMenu
          collapsed={collapsed}
          onClose={() => setIsProfileMenuOpen(false)}
          user={user}
          roleDisplay={roleDisplay}
        />
      )}

      {collapsed ? (
        /* Collapsed Footer */
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/dashboard/account-settings"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            title="Account Settings"
            aria-label="Account Settings"
          >
            <MdSettings className="text-lg" />
          </Link>

          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="cursor-pointer group focus:outline-none truncate"
            type="button"
            aria-label="User account menu"
            title={fullName}
          >
            {user?.avatarURL ? (
              <div className="w-9 h-9 rounded-full overflow-hidden border border-border group-hover:border-primary transition-all shadow-sm">
                <Image
                  src={user.avatarURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={36}
                  height={36}
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold group-hover:border-primary transition-colors shadow-sm">
                {initials}
              </div>
            )}
          </button>
        </div>
      ) : (
        /* Expanded Footer */
        <div className="flex items-center justify-between gap-1 p-1 rounded-lg hover:bg-card-hover transition-colors">
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
            type="button"
            aria-label="User account menu"
          >
            {user?.avatarURL ? (
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-border group-hover:border-primary/50 transition-colors">
                <Image
                  src={user.avatarURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={36}
                  height={36}
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0 group-hover:border-primary transition-colors">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {fullName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1 py-0.2 rounded capitalize tracking-wider shrink-0">
                  {roleDisplay}
                </span>
              </div>
            </div>
          </button>

          <Link
            href="/dashboard/account-settings"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border transition-colors shrink-0"
            title="Account Settings"
            aria-label="Account Settings"
          >
            <MdSettings className="text-lg" />
          </Link>
        </div>
      )}
    </div>
  );
}
