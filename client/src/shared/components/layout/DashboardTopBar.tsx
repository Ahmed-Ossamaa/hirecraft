"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { UserDropdown } from "./UserDropdown";

export function DashboardTopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border/60 shrink-0 w-full">
      {/* Left: page context */}
      <div>
        <h2 className="font-headline-sm text-headline-sm text-foreground font-semibold">
          Dashboard
        </h2>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-space-md">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-card-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-all cursor-pointer shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <MdLightMode className="text-lg" />
            ) : (
              <MdDarkMode className="text-lg" />
            )}
          </button>
        )}

        {/* User dropdown */}
        <UserDropdown showName={true} />
      </div>
    </header>
  );
}
