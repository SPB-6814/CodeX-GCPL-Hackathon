'use client';

import React, { useState } from 'react';

const ACTIVITIES = [
  { id: 'run', icon: 'directions_run', label: 'Running' },
  { id: 'swim', icon: 'pool', label: 'Swimming' },
  { id: 'yoga', icon: 'self_improvement', label: 'Yoga' },
  { id: 'weights', icon: 'fitness_center', label: 'Weights' }
];

const INTENSITIES = ['Low', 'Mid', 'Max'];

export function MovementLog() {
  const [selectedActivity, setSelectedActivity] = useState('run');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState('Low');

  return (
    <div className="p-lg bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(48,99,94,0.05)] space-y-lg border-l-[4px] border-secondary-container">
      <div>
        <p className="text-label-sm font-label-sm text-on-surface mb-md">Select Activity Type</p>
        <div className="flex flex-wrap gap-base">
          {ACTIVITIES.map((activity) => {
            const isActive = selectedActivity === activity.id;
            
            return (
              <button 
                key={activity.id}
                onClick={() => setSelectedActivity(activity.id)}
                className={`px-md py-sm rounded-full text-label-sm font-label-sm flex items-center gap-xs transition-colors ${
                  isActive 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{activity.icon}</span> 
                {activity.label}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="space-y-base">
          <label className="text-label-sm font-label-sm text-on-surface">Duration (Minutes)</label>
          <div className="flex items-center gap-md">
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-surface-container border-none rounded-lg text-body-md focus:ring-2 focus:ring-primary px-4 py-2" 
            />
            <span className="text-on-surface-variant font-label-sm">min</span>
          </div>
        </div>
        
        <div className="space-y-base">
          <label className="text-label-sm font-label-sm text-on-surface">Perceived Intensity</label>
          <div className="bg-surface-container-low rounded-xl p-xs flex gap-xs">
            {INTENSITIES.map((lvl) => (
              <button 
                key={lvl}
                onClick={() => setIntensity(lvl)}
                className={`flex-1 py-base text-label-sm font-label-sm rounded-lg transition-colors ${
                  intensity === lvl
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
