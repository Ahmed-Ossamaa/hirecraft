"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  MdPerson,
  MdSettings,
  MdLogout,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { User } from "@/shared/api/generated/model";
import { useLogout } from "@/features/auth/hooks/useLogout";

interface SidebarProfileMenuProps {
  collapsed: boolean;
  onClose: () => void;
  user: User | null;
  roleDisplay: string;
}

export function SidebarProfileMenu({
  collapsed,
  onClose,
  user,
  roleDisplay,
}: SidebarProfileMenuProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { logout, isLoggingOut } = useLogout({
    onSuccess: onClose,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <div
      className={`
        absolute bg-card border border-border shadow-2xl rounded-xl p-1.5 z-50
        animate-in fade-in zoom-in-95 duration-100
        ${
          collapsed
            ? "left-full bottom-2 ml-3 w-56"
            : "bottom-full left-2 right-2 mb-2"
        }
      `}
    >
      {/* Header Info */}
      <div className="px-3 py-2 border-b border-border/50">
        <p className="text-sm font-semibold text-foreground truncate">
          {fullName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded capitalize tracking-wider">
            {roleDisplay}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {user?.email}
        </p>
      </div>

      {/* Menu Links */}
      <div className="py-1 space-y-0.5">
        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <MdPerson className="text-base shrink-0" />
          <span>My Profile</span>
        </Link>

        <Link
          href="/dashboard/account-settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <MdSettings className="text-base shrink-0" />
          <span>Account Settings</span>
        </Link>

        {/* Theme Switcher */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? (
                <MdLightMode className="text-base shrink-0" />
              ) : (
                <MdDarkMode className="text-base shrink-0" />
              )}
              <span>Theme</span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="pt-1 mt-1 border-t border-border/50">
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <MdLogout className="text-base shrink-0" />
          <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
        </button>
      </div>
    </div>
  );
}
