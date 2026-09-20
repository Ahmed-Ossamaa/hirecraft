"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { MdSquareFoot, MdAdd, MdDarkMode, MdLightMode } from 'react-icons/md';
import { Button } from '@/shared/components/ui/Button';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

          {/* will be redered based on auth later */}
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

          <div className="flex items-center pl-space-xs relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-border">
            {/* will be changed later to avatar and dropdown or maybe just dropdown */}
            <Image 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaD1MiA1ugm4H7VdyOZzgA8OEKVVxoz6MEmEYXpUqMY4-q6eUD8iJQkcbrH4t1ussoY6wfIhVKfKrWvNP2zevb92sDuqBJnsIiwUP-VFyooyVN5KG3wtfBON8y1Tzdajs0TzNdNdaGshalz5P17nblZdakAy0TT-THK4Wb1QqQFVbRYba6WsakSD8YXy-kGvyhXBF8xW0CUy62bN64-W-CwrNOX5dNK1TwaD7mOBJRP9z8epxTUFyq" 
              fill
              sizes='500'
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
