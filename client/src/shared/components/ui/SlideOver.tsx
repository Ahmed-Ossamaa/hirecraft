"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export const SlideOver: React.FC<SlideOverProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = 'max-w-2xl'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-100 flex justify-end bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div 
        className={`bg-card w-full ${width} h-full border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4  border-b border-border/50 shrink-0 bg-card z-10">
          <h3 className="font-headline font-semibold text-xl text-foreground">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-input text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
