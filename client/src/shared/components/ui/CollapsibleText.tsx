'use client'

import React, { useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  maxLength = 400,
  className = "text-muted-foreground leading-relaxed whitespace-pre-wrap",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;

  const needsTruncation = text.length > maxLength;
  const displayedText = isExpanded || !needsTruncation ? text : `${text.slice(0, maxLength)}...`;

  return (
    <div className="relative">
      <p className={className}>{displayedText}</p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-full mx-auto cursor-pointer"
        >
          {isExpanded ? (
            <>
              View Less <MdKeyboardArrowUp className="text-lg" />
            </>
          ) : (
            <>
              View More <MdKeyboardArrowDown className="text-lg" />
            </>
          )}
        </button>
      )}
    </div>
  );
};
