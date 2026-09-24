import React from 'react';
import { MdErrorOutline } from 'react-icons/md';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2 ${className}`}>
      <MdErrorOutline className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-red-500 text-sm font-medium leading-tight">
        {message}
      </p>
    </div>
  );
};
