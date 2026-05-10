import React from 'react';
import { SideNav } from '@/components/layout/SideNav';
import { TopNav } from '@/components/layout/TopNav';
import { MobileNav } from '@/components/layout/MobileNav';

export default function ProfilePage() {
  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
      <SideNav />
      <TopNav title="Profile" />
      
      <main className="md:ml-64 p-container-margin md:p-xl max-w-[1140px] mx-auto pb-32">
        <div className="bg-surface-container-low rounded-[24px] p-xl text-center border border-outline-variant/30 mt-xl">
          <span className="material-symbols-outlined text-primary mb-md" style={{ fontSize: '48px' }}>
            person
          </span>
          <h2 className="text-headline-lg font-headline-lg mb-sm">User Profile</h2>
          <p className="text-body-lg text-on-surface-variant mb-lg max-w-md mx-auto">
            Manage your Active Serenity settings and preferences. This feature is currently under development.
          </p>
          <button className="bg-primary text-on-primary px-lg py-sm rounded-xl font-label-sm hover:opacity-90 transition-opacity">
            Settings
          </button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
