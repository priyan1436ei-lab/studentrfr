'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import DashboardView from '../components/DashboardView';
import GymView from '../components/GymView';
import MuscleMapView from '../components/MuscleMapView';
import TrophiesView from '../components/TrophiesView';
import SocialView from '../components/SocialView';
import AIView from '../components/AIView';
import SettingsView from '../components/SettingsView';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Compass, 
  Trophy, 
  Users, 
  BrainCircuit, 
  Settings, 
  LogOut,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';

type TabType = 'dashboard' | 'gym' | 'muscle' | 'trophies' | 'social' | 'ai' | 'settings';

export default function HomePage() {
  const { user, profile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Gamification variables
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const currentXpInLevel = xp % 1000;
  const xpPercentage = Math.round((currentXpInLevel / 1000) * 100);
  const streak = profile?.streak ?? 0;

  // Sync state
  useEffect(() => {
    // If layout is loaded, double check local profile.
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'gym':
        return <GymView />;
      case 'muscle':
        return <MuscleMapView />;
      case 'trophies':
        return <TrophiesView />;
      case 'social':
        return <SocialView />;
      case 'ai':
        return <AIView />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b13] overflow-hidden text-slate-200 font-sans">
      {/* BACKGROUND NEON GLOW DECORATIONS */}
      <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-64 bg-[#0a0f1d]/90 border-r border-slate-900/60 p-6 flex flex-col justify-between relative z-10 shrink-0 hidden md:flex">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg text-white shadow shadow-sky-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              FitVerse AI
            </h1>
          </div>

          {/* Gamified Profile Box */}
          <div className="bg-[#111827]/40 border border-slate-850 p-4 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Athlete Rank</p>
                <h4 className="text-sm font-bold text-white leading-tight">{user?.name}</h4>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-pink-400 font-extrabold bg-pink-500/5 border border-pink-500/10 px-2 py-0.5 rounded-full shadow">
                  <Flame className="h-3.5 w-3.5 fill-current text-pink-500 animate-pulse" /> {streak}d
                </div>
              )}
            </div>

            {/* Level and XP progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-amber-500" /> Level {level}</span>
                <span>{currentXpInLevel} / 1000 XP</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Menu Links */}
          <nav className="space-y-1.5">
            {[
              { tab: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
              { tab: 'gym', name: '3D Gym Room', icon: Dumbbell },
              { tab: 'muscle', name: '3D Muscle Map', icon: Compass },
              { tab: 'trophies', name: 'Trophy Room', icon: Trophy },
              { tab: 'social', name: 'Social Hub', icon: Users },
              { tab: 'ai', name: 'AI Personal Coach', icon: BrainCircuit },
              { tab: 'settings', name: 'Profile Settings', icon: Settings }
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as TabType)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow shadow-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <IconComp className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout triggers */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-3.5 border border-slate-900 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400 font-bold rounded-xl text-xs flex items-center gap-3 transition"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTAINER CONTENT VIEW */}
      <main className="flex-1 min-h-screen flex flex-col relative z-10 overflow-y-auto">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-900/60 flex items-center justify-between px-6 shrink-0 bg-[#070b13]/60 backdrop-blur-md">
          <div>
            <h2 className="text-base font-bold text-white capitalize leading-tight">
              {activeTab === 'dashboard' ? 'Overview Stats' : activeTab.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold">Today: {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Tab view area */}
        <div className="flex-1 p-6 relative max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
