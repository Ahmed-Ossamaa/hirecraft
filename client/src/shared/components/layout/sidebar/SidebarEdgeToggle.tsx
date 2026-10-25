"use client";

import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface SidebarEdgeToggleProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarEdgeToggle({
  collapsed,
  setCollapsed,
}: SidebarEdgeToggleProps) {
  return (
    <button
      onClick={() => setCollapsed((prev) => !prev)}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 rounded-full bg-card/50 border border-border/80 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-card-hover transition-all cursor-pointer ring-[0.0625rem] ring-primary/20 focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {collapsed ? (
        <MdChevronRight className="text-sm" />
      ) : (
        <MdChevronLeft className="text-sm" />
      )}
    </button>
  );
}
