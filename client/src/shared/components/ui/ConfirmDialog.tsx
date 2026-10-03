"use client";

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { MdWarning } from 'react-icons/md';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      maxWidth="max-w-sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="px-3">
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
            className="px-3"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3 text-sm text-muted-foreground mt-2">
        {variant === 'danger' && (
          <MdWarning className="text-red-500 text-2xl shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};
