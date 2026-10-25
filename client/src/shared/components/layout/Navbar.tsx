"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MdSquareFoot,
  MdDarkMode,
  MdLightMode,
  MdSearch,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserDropdown } from "./UserDropdown";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    if (input && input.value.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(input.value.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm  shadow-lg shadow-black/20">
      <div className="h-16 md:h-20 max-w-360 mx-auto px-4 md:px-margin-desktop flex items-center justify-between gap-4 md:gap-gutter-desktop">
        {/* Left Side: Logo & nav Links */}
        <div className="flex items-center gap-6 lg:gap-space-2xl">
          <Link
            className="flex items-center gap-space-xs group cursor-pointer"
            href="/"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary transition-transform group-hover:border-primary group-hover:scale-105 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              <MdSquareFoot className="text-[18px] md:text-[20px]" />
            </div>
            <div className="flex items-center gap-space-2xs">
              <span className="font-headline-sm text-lg md:text-headline-sm text-foreground tracking-tight">
                Technically
              </span>
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
            </div>
          </Link>

          {/* Desktop & Tablet Nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-space-xl">
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-sm lg:text-body-md cursor-pointer"
              href="/jobs"
            >
              Browse Jobs
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-sm lg:text-body-md cursor-pointer"
              href="/companies"
            >
              Companies
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-sm lg:text-body-md cursor-pointer"
              href="/pricing"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/*Search Input (Desktop & Tablet) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center relative flex-1 max-w-xs lg:max-w-sm mx-2 lg:mx-4"
        >
          <input
            name="search"
            type="text"
            placeholder="Search Jobs..."
            className="w-full bg-card-hover/80 border border-border text-foreground font-body-sm text-sm rounded-full pl-4 pr-10 py-1.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground placeholder:text-xs shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            aria-label="Search"
          >
            <MdSearch className="text-[18px]" />
          </button>
        </form>

        {/* Right Side: Theme Toggle & Auth Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:gap-space-md">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg bg-card-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <MdLightMode className="text-[16px] md:text-[18px]" />
              ) : (
                <MdDarkMode className="text-[16px] md:text-[18px]" />
              )}
            </button>
          )}

          {/* User Dropdown ( if authenticated) */}
          {mounted && isAuthenticated && (
            <div className="flex items-center">
              <UserDropdown showName={false} />
            </div>
          )}

          {/* Unauthenticated Actions (Hidden on mobile, shown on md and above) */}
          {mounted && !isAuthenticated && (
            <div className="hidden md:flex items-center">
              <Button
                variant="secondary"
                className="uppercase tracking-wider px-3 md:px-space-md py-1.5 md:py-space-xs text-xs md:text-sm"
                onClick={() => router.push("/auth")}
              >
                Sign In
              </Button>
            </div>
          )}

          {!mounted && (
            <div className="hidden md:block w-20 md:w-24 h-9"></div>
          )}

          {/* Mobile Menu Toggle (Visible only on mobile) */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-foreground hover:bg-card-hover transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? (
              <MdClose className="text-[22px]" />
            ) : (
              <MdMenu className="text-[22px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background/97 backdrop-blur-3xl border-b border-border shadow-xl flex flex-col px-4 py-6 gap-6 z-99">
          <form
            onSubmit={handleSearch}
            className="flex items-center relative w-full"
          >
            <input
              name="search"
              type="text"
              placeholder="Search Jobs..."
              className="w-full bg-card-hover/80 border border-border text-foreground font-body-sm text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground placeholder:text-xs shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              aria-label="Search"
            >
              <MdSearch className="text-[20px]" />
            </button>
          </form>

          <nav className="flex flex-col gap-4 px-2">
            <Link
              className="text-foreground hover:text-primary transition-colors font-body-lg text-lg font-medium cursor-pointer"
              href="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            <Link
              className="text-foreground hover:text-primary transition-colors font-body-lg text-lg font-medium cursor-pointer"
              href="/companies"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Companies
            </Link>
            <Link
              className="text-foreground hover:text-primary transition-colors font-body-lg text-lg font-medium cursor-pointer"
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>

          {mounted && !isAuthenticated && (
            <>
              <div className="w-full h-px bg-border/60"></div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="secondary"
                  className="w-full uppercase tracking-wider py-3"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/auth");
                  }}
                >
                  Sign In
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
