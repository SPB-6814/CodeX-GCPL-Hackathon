import React from 'react';
import Image from 'next/image';
import { SideNav } from '@/components/layout/SideNav';
import { TopNav } from '@/components/layout/TopNav';
import { MobileNav } from '@/components/layout/MobileNav';
import { WellScoreRing } from '@/components/visualizations/WellScoreRing';
import { Sparkline } from '@/components/visualizations/Sparkline';

export default function DashboardPage() {
  const sparklineData = [60, 45, 70, 85, 65, 75, 82];
  const sparklineLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen">
      <SideNav />
      <TopNav title="Overview" />
      
      <main className="md:ml-64 p-container-margin md:p-xl max-w-[1140px] mx-auto pb-32">
        {/* Bento Grid Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-xl">
          {/* WellScore™ Visualization */}
          <section className="md:col-span-7 bg-surface-container-lowest rounded-[24px] p-lg flex flex-col md:flex-row items-center gap-xl shadow-[0_4px_20px_rgba(48,99,94,0.05)] border border-outline-variant/30">
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <WellScoreRing score={82} />
            </div>
            
            <div className="flex-1 w-full">
              <h3 className="text-headline-md font-headline-md mb-xs">Looking Sharp</h3>
              <p className="text-body-md font-body-md text-on-surface-variant mb-md">
                Your recovery is up 12% from last week. Keep this momentum.
              </p>
              
              <Sparkline data={sparklineData} labels={sparklineLabels} />
            </div>
          </section>

          {/* Daily Insight Card */}
          <section className="md:col-span-5 bg-primary-container text-on-primary-container rounded-[24px] p-lg flex flex-col justify-between overflow-hidden relative border border-primary/20">
            <div className="z-10">
              <span className="material-symbols-outlined text-on-primary-fixed-variant mb-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
              <h3 className="text-headline-md font-headline-md leading-tight mb-sm">Daily Insight</h3>
              <p className="text-body-lg font-body-lg opacity-90">
                &quot;You score highest after Yoga. Consider a 15-min flow today to maintain your peak recovery state.&quot;
              </p>
            </div>
            <div className="mt-lg z-10">
              <button className="bg-on-primary-container text-primary px-md py-sm rounded-full font-label-sm hover:opacity-90 transition-opacity">
                View History
              </button>
            </div>
            {/* Abstract visual element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-on-primary-container/10 rounded-full blur-3xl"></div>
          </section>
        </div>

        {/* Secondary Row: Streaks & Buddies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-xl">
          {/* Streak Card */}
          <div className="bg-surface-container-low rounded-[24px] p-md flex items-center gap-md border border-outline-variant/50">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
            </div>
            <div>
              <h4 className="text-label-sm font-label-sm text-on-surface-variant">Current Streak</h4>
              <p className="text-headline-md font-headline-md">14 Days Active</p>
            </div>
            <div className="ml-auto flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary border border-surface-container-low"></div>
              ))}
            </div>
          </div>

          {/* Accountability Buddy */}
          <div className="bg-surface-container-low rounded-[24px] p-md flex items-center gap-md border border-outline-variant/50">
            <div className="flex-1">
              <h4 className="text-label-sm font-label-sm text-on-surface-variant">Accountability Buddy</h4>
              <div className="flex items-center gap-sm mt-xs">
                <div className="w-8 h-8 rounded-full bg-surface-variant border border-white relative overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100" 
                    alt="Friend Profile" 
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-body-md font-body-md font-bold">Alex is 2 days ahead!</p>
              </div>
            </div>
            <button className="px-md py-xs border border-primary text-primary rounded-full text-label-sm hover:bg-primary/5 transition-colors">
              Nudge Alex
            </button>
          </div>
        </div>

        {/* Improve Feed: AI Recommendations */}
        <header className="flex items-center justify-between mb-md">
          <h2 className="text-headline-lg font-headline-lg">Improve Feed</h2>
          <span className="text-primary font-bold flex items-center gap-xs cursor-pointer hover:underline text-label-sm">
            AI Powered <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </span>
        </header>

        <div className="space-y-gutter">
          {/* 1. Activity Card (Primary) */}
          <div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
            <div className="w-full md:w-48 h-48 bg-surface-variant relative overflow-hidden shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600" 
                alt="Yoga Flow" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-md flex-1 flex flex-col justify-center border-l-2 border-primary">
              <div className="flex items-center gap-xs text-label-sm text-primary mb-xs">
                <span className="material-symbols-outlined text-sm">fitness_center</span>
                Activity Recommendation
              </div>
              <h3 className="text-headline-md font-headline-md mb-xs">Vinyasa Flow Session</h3>
              <p className="text-body-md font-body-md text-on-surface-variant mb-md">
                Based on your lower HRV today, a 20-minute gentle flow will optimize your autonomic nervous system.
              </p>
              <div className="flex gap-sm">
                <button className="bg-primary text-on-primary px-md py-base rounded-xl font-label-sm hover:opacity-90">
                  Start Now
                </button>
                <button className="text-on-surface-variant px-md py-base font-label-sm hover:bg-surface-variant/20 rounded-xl">
                  Remind Me Later
                </button>
              </div>
            </div>
          </div>

          {/* 2. Recovery Card */}
          <div className="group bg-surface-container-lowest rounded-[24px] overflow-hidden flex flex-col md:flex-row shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
            <div className="w-full md:w-48 h-48 bg-surface-variant relative overflow-hidden shrink-0">
              <Image 
                src="https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=600" 
                alt="Sleep Recovery" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-md flex-1 flex flex-col justify-center border-l-2 border-[#82a39d]">
              <div className="flex items-center gap-xs text-label-sm text-secondary mb-xs">
                <span className="material-symbols-outlined text-sm">bedtime</span>
                Recovery Optimization
              </div>
              <h3 className="text-headline-md font-headline-md mb-xs">Sleep Hygiene Protocol</h3>
              <p className="text-body-md font-body-md text-on-surface-variant mb-md">
                You&apos;ve had 3 nights of fragmented sleep. Try the 4-7-8 breathing technique before bed tonight.
              </p>
              <div className="flex gap-sm">
                <button className="bg-secondary-container text-on-secondary-container px-md py-base rounded-xl font-label-sm hover:opacity-90">
                  Learn Technique
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* 3. Challenge Card */}
            <div className="bg-surface-container-lowest rounded-[24px] p-md border border-outline-variant/30 flex flex-col h-full">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-on-error-container">emoji_events</span>
              </div>
              <h3 className="text-body-lg font-bold mb-xs">Hydration Hero</h3>
              <p className="text-body-md text-on-surface-variant mb-md flex-1">
                Challenge: Drink 3L of water for 5 consecutive days.
              </p>
              <button className="w-full border border-primary text-primary py-base rounded-xl font-label-sm hover:bg-primary/5">
                Accept Challenge
              </button>
            </div>

            {/* 4. Spotlight Card */}
            <div className="bg-surface-container-lowest rounded-[24px] p-md border border-outline-variant/30 flex flex-col h-full relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined text-on-primary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
                <h3 className="text-body-lg font-bold mb-xs">New Gear Analysis</h3>
                <p className="text-body-md text-on-surface-variant mb-md flex-1">
                  Your new smart ring data is now integrated with your SportWell profile.
                </p>
                <button className="w-full bg-surface-container-high py-base rounded-xl font-label-sm hover:bg-surface-variant">
                  Sync Status
                </button>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full"></div>
            </div>

            {/* 5. Nudge Card */}
            <div className="bg-surface-container-lowest rounded-[24px] p-md border border-outline-variant/30 flex items-start gap-md h-full">
              <div className="flex-1">
                <div className="text-label-sm text-tertiary font-bold mb-xs uppercase tracking-wider">Smart Nudge</div>
                <h3 className="text-body-md font-bold mb-xs">Sedentary Alert</h3>
                <p className="text-label-sm text-on-surface-variant">
                  You&apos;ve been still for 90 minutes. A 2-minute walk now will boost your score by +2.
                </p>
              </div>
              <button className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 hover:bg-secondary/90 transition-colors">
                <span className="material-symbols-outlined">directions_walk</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Only Home/Dashboard) */}
      <button className="fixed right-md bottom-24 md:bottom-md w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <MobileNav />
    </div>
  );
}
