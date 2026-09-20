import React from 'react';
import { Navbar, Footer } from '@/shared/components';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
}