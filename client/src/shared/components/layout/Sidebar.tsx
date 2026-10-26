"use client";

import React from "react";
import Link from "next/link";
import { MdSquareFoot } from "react-icons/md";
import { SidebarNav } from "./sidebar/SidebarNav";
import { SidebarFooter } from "./sidebar/SidebarFooter";
import { SidebarEdgeToggle } from "./sidebar/SidebarEdgeToggle";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
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
        {/* Vertically centered edge collapse/expand button */}
        <SidebarEdgeToggle
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Logo Header */}
        <div className="h-16 flex items-center px-4 border-b border-border/60 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-space-xs group w-full"
          >
            <div className="w-9 h-9 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary transition-transform group-hover:border-primary group-hover:scale-105 shadow-sm shrink-0">
              <MdSquareFoot className="text-[20px]" />
            </div>
            {!collapsed && (
              <span className="font-headline-sm text-headline-sm text-foreground tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                Technically
              </span>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <SidebarNav collapsed={collapsed} />

        {/* User profile & actions footer */}
        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
}
