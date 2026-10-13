"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdPerson,
  MdDashboard,
  MdLogout,
  MdSettings,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useLogout } from "@/shared/api/generated/auth/auth";
import { toast } from "sonner";

interface UserDropdownProps {
  showName?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  showName = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, clearAuth } = useAuthStore();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      clearAuth();
      setIsDropdownOpen(false);
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-2 rounded-full cursor-pointer transition-colors ${
          showName
            ? "px-3 py-1.5 hover:bg-card-hover rounded-lg"
            : "justify-center w-8 h-8 md:w-9 md:h-9 bg-input border-2 border-border overflow-hidden hover:border-primary"
        }`}
        type="button"
        aria-label="User dropdown menu"
        aria-expanded={isDropdownOpen}
      >
        {showName ? (
          <>
            {user?.avatarURL ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image
                  src={user.avatarURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <span className="text-sm text-foreground font-medium hidden sm:inline">
              {fullName}
            </span>
            <MdKeyboardArrowDown
              className={`text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </>
        ) : user?.avatarURL ? (
          <Image
            alt="Profile"
            src={user.avatarURL}
            className="w-full h-full object-cover"
            width={36}
            height={36}
          />
        ) : (
          <MdPerson className="text-[18px] md:text-xl text-muted-foreground" />
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <MdDashboard className="text-[16px]" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <MdPerson className="text-[16px]" />
              My Profile
            </Link>
            <Link
              href="/dashboard/account-settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <MdSettings className="text-[16px]" />
              Account Settings
            </Link>
          </div>

          <div className="border-t border-border/50 py-1">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
              <MdLogout className="text-[16px]" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
