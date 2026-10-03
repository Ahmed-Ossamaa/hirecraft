"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = 'max-w-md'
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80  animate-in fade-in duration-200"
    >
      <div 
        className={`bg-card w-full ${maxWidth} rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 shrink-0">
          <h3 className="font-headline font-semibold text-lg text-foreground">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-input text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-2 border-t border-border/50 shrink-0 bg-background/10">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
