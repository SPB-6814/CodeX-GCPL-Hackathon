'use client';

import React from 'react';

interface WellScoreRingProps {
  score: number;
  label?: string;
  className?: string;
}

export function WellScoreRing({ score, label = "WellScore™", className = "" }: WellScoreRingProps) {
  // SVG circular progress calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius; // ~565.48
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
        <circle 
          className="text-surface-variant" 
          cx="96" 
          cy="96" 
          fill="transparent" 
          r={radius} 
          stroke="currentColor" 
          strokeWidth="8"
        />
        <circle 
          className="transition-all duration-1000 ease-in-out" 
          cx="96" 
          cy="96" 
          fill="transparent" 
          r={radius} 
          stroke="url(#scoreGradient)" 
          strokeLinecap="round" 
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#30635e" />
            <stop offset="100%" stopColor="#9dd0ca" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display-score font-display-score text-primary">{score}</span>
        <span className="text-label-sm font-label-sm text-on-surface-variant">{label}</span>
      </div>
    </div>
  );
}
