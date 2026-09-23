"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MdSquareFoot, MdAdd, MdDarkMode, MdLightMode } from 'react-icons/md';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { UserDropdown } from './UserDropdown';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/40">
      <div className="h-20 max-w-360 mx-auto px-margin-desktop flex items-center justify-between gap-gutter-desktop">
        <div className="flex items-center gap-space-2xl">
          <Link className="flex items-center gap-space-xs group cursor-pointer" href="/">
            <div className="w-9 h-9 rounded-lg bg-card-hover border border-border flex items-center justify-center text-primary transition-transform group-hover:border-primary group-hover:scale-105 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
              <MdSquareFoot className="text-[20px]" />
            </div>
            <div className="flex items-center gap-space-2xs">
              <span className="font-headline-sm text-headline-sm text-foreground tracking-tight">Technically</span>
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-space-xl">
            <Link className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-body-md cursor-pointer" href="/jobs">Browse Jobs</Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-body-md cursor-pointer" href="#">For Factories</Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-body-md cursor-pointer" href="#">Machinery Index</Link>
            <Link className="text-muted-foreground hover:text-foreground transition-colors font-body-md text-body-md cursor-pointer" href="#">Salary Benchmarks</Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-card-hover border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <MdLightMode className="text-[18px]" /> : <MdDarkMode className="text-[18px]" />}
            </button>
          )}

          {mounted ? (
            isAuthenticated ? (
              <div className="ml-2">
                <UserDropdown showName={false} />
              </div>
            ) : (
              <>
                <Button 
                  variant="secondary"
                  className="uppercase tracking-wider px-space-md py-space-xs"
                  onClick={() => router.push('/auth')}
                >
                  Sign In
                </Button>

                <Button 
                  variant="primary"
                  className="uppercase tracking-wider px-space-lg py-space-xs shadow-md shadow-sky-950/40"
                  leftIcon={<MdAdd className="text-[16px]" />}
                  onClick={() => router.push('/post-job')}
                >
                  Post a Job
                </Button>
              </>
            )
          ) : (
            // fallback
            <div className="w-50 h-9"></div>
          )}
        </div>
      </div>
    </header>
  );
};
