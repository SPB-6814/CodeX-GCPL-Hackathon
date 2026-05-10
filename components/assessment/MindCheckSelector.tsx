'use client';

import React, { useState } from 'react';

const MOODS = [
  { id: 'low', emoji: '😫', label: 'Low' },
  { id: 'steady', emoji: '😐', label: 'Steady' },
  { id: 'zen', emoji: '🧘', label: 'Zen' },
  { id: 'sharp', emoji: '🔥', label: 'Sharp' }
];

export function MindCheckSelector() {
  const [selected, setSelected] = useState('zen');

  return (
    <div className="flex justify-between items-center max-w-md mx-auto">
      {MOODS.map((mood) => {
        const isActive = selected === mood.id;
        
        return (
          <button 
            key={mood.id}
            onClick={() => setSelected(mood.id)}
            className={`flex flex-col items-center gap-xs p-base rounded-xl transition-colors group ${
              isActive 
                ? 'bg-secondary-container text-on-secondary-container' 
                : 'hover:bg-surface-container'
            }`}
          >
            <span className={`text-3xl transition-all ${!isActive ? 'grayscale group-hover:grayscale-0' : ''}`}>
              {mood.emoji}
            </span>
            <span className={`text-label-sm font-label-sm ${isActive ? '' : 'text-on-surface-variant'}`}>
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
