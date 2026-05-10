import React from 'react';
import Image from 'next/image';

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  return (
    <header className="flex justify-between items-center w-full px-container-margin py-base max-w-[1140px] mx-auto md:ml-64 md:max-w-[calc(1140px-256px)] backdrop-blur-md bg-surface/80 dark:bg-surface-dim/80 docked full-width top-0 sticky z-40">
      <div className="flex items-center gap-sm">
        <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim md:hidden">
          SportWell
        </span>
        <div className="hidden md:block">
          <h2 className="text-headline-md font-headline-md font-bold text-primary">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        <span className="material-symbols-outlined text-on-surface-variant">history</span>
        <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden border border-outline-variant relative">
          <Image 
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100" 
            alt="User profile" 
            fill
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
