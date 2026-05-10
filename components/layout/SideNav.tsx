import React from 'react';
import Link from 'next/link';

export function SideNav() {
  return (
    <aside className="hidden md:flex flex-col h-full py-lg border-r border-outline-variant bg-surface-container-low dark:bg-surface-container w-64 fixed left-0 top-0 z-50">
      <div className="px-md mb-xl">
        <h1 className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim">SportWell</h1>
        <p className="text-label-sm font-label-sm text-on-surface-variant">Active Serenity</p>
      </div>
      
      <nav className="flex-1 px-sm space-y-base">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-sm bg-secondary-container text-on-secondary-container rounded-xl px-md py-sm translate-x-1 duration-200"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </Link>
        <Link 
          href="/assessments" 
          className="flex items-center gap-sm text-on-surface-variant px-md py-sm hover:bg-surface-variant/50 transition-all duration-200"
        >
          <span className="material-symbols-outlined">psychology</span>
          <span className="font-label-sm text-label-sm">Assessments</span>
        </Link>
        <Link 
          href="/community" 
          className="flex items-center gap-sm text-on-surface-variant px-md py-sm hover:bg-surface-variant/50 transition-all duration-200"
        >
          <span className="material-symbols-outlined">groups</span>
          <span className="font-label-sm text-label-sm">Community</span>
        </Link>
        <Link 
          href="/profile" 
          className="flex items-center gap-sm text-on-surface-variant px-md py-sm hover:bg-surface-variant/50 transition-all duration-200"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </Link>
      </nav>

      <div className="px-md mt-auto">
        <Link href="/assessments">
          <button className="w-full bg-primary text-on-primary py-sm rounded-xl font-label-sm hover:opacity-90 transition-opacity">
            Start Assessment
          </button>
        </Link>
      </div>
    </aside>
  );
}
