"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Assuming SideNav and MobileNav are in your layout files, we'll keep the imports 
// but you might want to move them to layout.tsx instead of this page file.
import { SideNav } from '@/components/layout/SideNav';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AssessmentPage() {
  // 1. State Management for Assessment Inputs
  const [bodyMetrics, setBodyMetrics] = useState({
    energy: 7, // 1-10
    sleep: 4,  // 1-5
    soreness: 2, // 1-5 (lower is better)
    hydration: 5, // 1-5
  });

  const [mindMetrics, setMindMetrics] = useState({
    focus: 'Zen', // Low, Steady, Zen, Sharp
    stress: 3, // 1-5 (lower is better)
    social: 4, // 1-5
  });

  const [journalEntry, setJournalEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 2. Live WellScore Calculation Engine
  const liveWellScore = useMemo(() => {
    // Normalize body metrics to a 0-100 scale
    const energyScore = (bodyMetrics.energy / 10) * 100;
    const sleepScore = (bodyMetrics.sleep / 5) * 100;
    const sorenessScore = ((6 - bodyMetrics.soreness) / 5) * 100; // Invert: low soreness = high score
    const hydrationScore = (bodyMetrics.hydration / 5) * 100;

    const bodyAverage = (energyScore + sleepScore + sorenessScore + hydrationScore) / 4;

    // Normalize mind metrics to a 0-100 scale
    const stressScore = ((6 - mindMetrics.stress) / 5) * 100; // Invert: low stress = high score
    const socialScore = (mindMetrics.social / 5) * 100;

    const mindAverage = (stressScore + socialScore) / 2;

    // Composite Score (60% Body, 40% Mind for this MVP)
    return Math.round((bodyAverage * 0.6) + (mindAverage * 0.4));
  }, [bodyMetrics, mindMetrics]);

  // Determine color based on score (Red/Amber/Green logic)
  const scoreColor = liveWellScore >= 75 ? 'text-primary' : liveWellScore >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreStroke = liveWellScore >= 75 ? '#006970' : liveWellScore >= 50 ? '#f59e0b' : '#ef4444';

  // Calculate stroke offset for SVG circle (circumference = 2 * pi * r = 2 * 3.14 * 70 = 439.6)
  const strokeOffset = 440 - (440 * liveWellScore) / 100;

  // 3. LocalStorage Persistence Logic
  const handleSaveSession = () => {
    setIsSaving(true);

    const sessionData = {
      id: Date.now(),
      date: new Date().toISOString(),
      score: liveWellScore,
      metrics: { body: bodyMetrics, mind: mindMetrics },
      journal: journalEntry
    };

    const existingHistory = JSON.parse(localStorage.getItem('sportWell_history') || '[]');
    const updatedHistory = [...existingHistory, sessionData];

    localStorage.setItem('sportWell_history', JSON.stringify(updatedHistory));

    setTimeout(() => {
      setIsSaving(false);
      alert("Session logged successfully! Streak updated.");
      // router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed-dim selection:text-on-primary-fixed min-h-screen">
      <div className="flex min-h-screen">
        {/* Note: SideNav should ideally be in layout.tsx, but kept here per your schema */}
        {/* <SideNav /> */}

        {/* Main Content Canvas */}
        <main className="flex-1 pb-32">
          {/* TopAppBar */}
          <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md px-container-margin py-base max-w-[1140px] mx-auto w-full flex justify-between items-center">
            <h2 className="text-headline-md font-bold text-primary">Daily Assessment</h2>
            <div className="flex gap-md">
              <span className="material-symbols-outlined text-primary">notifications</span>
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
          </header>

          <div className="max-w-[800px] mx-auto px-container-margin py-lg">

            {/* Progress Header */}
            <div className="mb-xl flex items-center justify-between">
              <div>
                <p className="text-label-sm text-primary uppercase tracking-widest">Assessment Module</p>
                <h3 className="text-headline-lg text-on-surface mt-xs">Mind-Body Calibration</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-label-sm text-on-surface-variant mb-xs">Step 1 of 3</span>
                <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-primary rounded-full transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Section 1: Body Check */}
            <section className="space-y-lg mb-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-base">
                <div className="p-base bg-primary-container/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">body_system</span>
                </div>
                <h4 className="text-headline-md text-on-surface">1. Body Check</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg bg-surface-container-lowest p-xl rounded-xl shadow-[0_4px_20px_rgba(48,99,94,0.05)] border-l-[4px] border-secondary-container">
                {/* Energy */}
                <div className="space-y-base">
                  <div className="flex justify-between items-center">
                    <label className="text-label-sm text-on-surface">Energy Level</label>
                    <span className="text-label-sm text-primary font-bold">{bodyMetrics.energy}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={bodyMetrics.energy}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, energy: parseInt(e.target.value) })}
                    className="custom-slider accent-primary"
                  />
                </div>
                {/* Sleep */}
                <div className="space-y-base">
                  <div className="flex justify-between items-center">
                    <label className="text-label-sm text-on-surface">Sleep Quality</label>
                    <span className="text-label-sm text-primary font-bold">{bodyMetrics.sleep}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={bodyMetrics.sleep}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, sleep: parseInt(e.target.value) })}
                    className="custom-slider accent-primary"
                  />
                </div>
                {/* Soreness */}
                <div className="space-y-base">
                  <div className="flex justify-between items-center">
                    <label className="text-label-sm text-on-surface">Muscle Soreness</label>
                    <span className="text-label-sm text-primary font-bold">{bodyMetrics.soreness}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={bodyMetrics.soreness}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, soreness: parseInt(e.target.value) })}
                    className="custom-slider accent-primary"
                  />
                </div>
                {/* Hydration */}
                <div className="space-y-base">
                  <div className="flex justify-between items-center">
                    <label className="text-label-sm text-on-surface">Hydration</label>
                    <span className="text-label-sm text-primary font-bold">{bodyMetrics.hydration}/5</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={bodyMetrics.hydration}
                    onChange={(e) => setBodyMetrics({ ...bodyMetrics, hydration: parseInt(e.target.value) })}
                    className="custom-slider accent-primary"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Mind Check */}
            <section className="space-y-lg mb-xl">
              <div className="flex items-center gap-base">
                <div className="p-base bg-secondary-container/20 rounded-lg text-secondary">
                  <span className="material-symbols-outlined">psychology_alt</span>
                </div>
                <h4 className="text-headline-md text-on-surface">2. Mind Check</h4>
              </div>

              <div className="space-y-md">
                <div className="p-lg bg-surface-container-lowest rounded-xl border-l-[4px] border-primary/20 shadow-[0_4px_20px_rgba(48,99,94,0.05)]">
                  <p className="text-body-md text-on-surface-variant mb-md">How would you describe your mental focus today?</p>
                  <div className="flex justify-between items-center max-w-md mx-auto">
                    {['Low', 'Steady', 'Zen', 'Sharp'].map((focusType, idx) => {
                      const emojis = ['😫', '😐', '🧘', '🔥'];
                      const isActive = mindMetrics.focus === focusType;
                      return (
                        <button
                          key={focusType}
                          onClick={() => setMindMetrics({ ...mindMetrics, focus: focusType })}
                          className={`flex flex-col items-center gap-xs p-base rounded-xl transition-colors group ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'hover:bg-surface-container text-on-surface-variant'}`}
                        >
                          <span className={`text-3xl transition-all ${isActive ? '' : 'grayscale group-hover:grayscale-0'}`}>
                            {emojis[idx]}
                          </span>
                          <span className="text-label-sm">{focusType}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="p-lg bg-surface-container-lowest rounded-xl border-l-[4px] border-primary/10">
                    <label className="text-label-sm text-on-surface block mb-base">Current Stress Level ({mindMetrics.stress}/5)</label>
                    <input
                      type="range" min="1" max="5"
                      value={mindMetrics.stress}
                      onChange={(e) => setMindMetrics({ ...mindMetrics, stress: parseInt(e.target.value) })}
                      className="custom-slider w-full accent-primary"
                    />
                  </div>
                  <div className="p-lg bg-surface-container-lowest rounded-xl border-l-[4px] border-primary/10">
                    <label className="text-label-sm text-on-surface block mb-base">Social Battery ({mindMetrics.social}/5)</label>
                    <input
                      type="range" min="1" max="5"
                      value={mindMetrics.social}
                      onChange={(e) => setMindMetrics({ ...mindMetrics, social: parseInt(e.target.value) })}
                      className="custom-slider w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* WellScore Journal */}
            <section className="space-y-lg mb-xl">
              <div className="flex items-center gap-base">
                <div className="p-base bg-primary-container/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <h4 className="text-headline-md text-on-surface">WellScore™ Journal</h4>
              </div>
              <div className="relative">
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg text-body-md focus:ring-2 focus:ring-primary focus:outline-none shadow-[0_4px_20px_rgba(48,99,94,0.05)] resize-none"
                  placeholder="Any recovery notes, injuries, or breakthroughs today?"
                  rows={4}
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                ></textarea>
              </div>
            </section>

            {/* Complete Action */}
            <div className="flex flex-col items-center justify-center space-y-md">
              <button
                onClick={handleSaveSession}
                disabled={isSaving}
                className="w-full max-w-md bg-primary text-on-primary text-headline-md py-md rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? "Syncing..." : "Complete Log & Sync"}
              </button>
              <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                Completing this will extend your 12-day streak!
              </p>
            </div>
          </div>
        </main>

        {/* WellScore Summary Side Widget (Desktop Only) */}
        <aside className="hidden xl:block fixed right-xl top-[120px] w-72 space-y-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_rgba(48,99,94,0.05)] border-t-[4px] border-primary">
            <h5 className="text-label-sm text-on-surface-variant uppercase mb-md">Live Projection</h5>
            <div className="relative flex items-center justify-center p-md">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  className="text-surface-container-highest"
                  cx="80" cy="80" r="70"
                  fill="transparent" stroke="currentColor" strokeWidth="8"
                ></circle>
                <circle
                  className="transition-all duration-700 ease-out"
                  cx="80" cy="80" r="70"
                  fill="transparent"
                  stroke={scoreStroke}
                  strokeWidth="8"
                  strokeDasharray="440"
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-display-score ${scoreColor}`}>{liveWellScore}</span>
                <span className="text-label-sm text-on-surface-variant">Projected</span>
              </div>
            </div>
            <p className="text-center text-body-md mt-md text-on-surface-variant">
              Your inputs suggest a focus on <span className="text-primary font-bold">active recovery</span> today.
            </p>
          </div>
        </aside>

      </div>
      {/* <MobileNav /> */}
    </div>
  );
}