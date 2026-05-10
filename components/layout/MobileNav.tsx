import React from 'react';
import Link from 'next/link';

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 md:hidden backdrop-blur-xl bg-surface/90 dark:bg-surface-dim/90 shadow-[0_-4px_20px_rgba(48,99,94,0.05)] rounded-t-xl">
      <Link 
        href="/dashboard" 
        className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90 transition-transform duration-200"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="text-label-sm font-label-sm">Home</span>
      </Link>
      <Link 
        href="/assessments" 
        className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary"
      >
        <span className="material-symbols-outlined">fitness_center</span>
        <span className="text-label-sm font-label-sm">Assess</span>
      </Link>
      <Link 
        href="/community" 
        className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary"
      >
        <span className="material-symbols-outlined">diversity_3</span>
        <span className="text-label-sm font-label-sm">Social</span>
      </Link>
      <Link 
        href="/profile" 
        className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary"
      >
        <span className="material-symbols-outlined">person</span>
        <span className="text-label-sm font-label-sm">Me</span>
      </Link>
    </nav>
  );
}
