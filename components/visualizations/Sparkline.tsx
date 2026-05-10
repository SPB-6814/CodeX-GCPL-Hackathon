'use client';

import React from 'react';

interface SparklineProps {
  data: number[]; // Array of values (0-100)
  labels: string[];
}

export function Sparkline({ data, labels }: SparklineProps) {
  // Check if we have data to render
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full">
      <div className="h-16 w-full flex items-end gap-xs">
        {data.map((value, index) => {
          // Highlight the last item (typically "today")
          const isLast = index === data.length - 1;
          
          return (
            <div 
              key={`bar-${index}`}
              className={`flex-1 rounded-t-full transition-all duration-500 ease-out ${
                isLast ? 'bg-primary' : 'bg-primary/20'
              }`} 
              style={{ height: `${value}%` }}
              aria-label={`${labels[index]}: ${value}%`}
            />
          );
        })}
      </div>
      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-xs text-[10px] text-on-surface-variant font-bold">
          {labels.map((label, index) => (
            <span key={`label-${index}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
