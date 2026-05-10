'use client';

import React, { useState } from 'react';

interface BodyCheckSliderProps {
  label: string;
  initialValue: number;
  min?: number;
  max?: number;
  displayValue?: (val: number) => string;
}

export function BodyCheckSlider({ 
  label, 
  initialValue, 
  min = 1, 
  max = 10,
  displayValue = (val) => `${val}/${max}`
}: BodyCheckSliderProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="space-y-base">
      <div className="flex justify-between items-center">
        <label className="text-label-sm font-label-sm text-on-surface">{label}</label>
        <span className="text-label-sm font-label-sm text-primary font-bold">
          {displayValue(value)}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 bg-[#e0e3e1] rounded-full appearance-none outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={{
          WebkitAppearance: 'none',
        }}
      />
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #30635e; /* primary matching */
          cursor: pointer;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #30635e;
          cursor: pointer;
          border-radius: 50%;
          transition: transform 0.2s;
          border: none;
        }
        input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
