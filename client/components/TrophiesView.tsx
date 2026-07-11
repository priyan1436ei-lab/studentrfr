'use client';

import React from 'react';
import TrophyRoom3D from '../three/TrophyRoom3D';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Trophy, CheckCircle, Lock, Award, ShieldAlert } from 'lucide-react';

const BADGE_MANIFEST = [
  { key: 'welcome', title: 'FitVerse Pioneer', desc: 'Welcome to the fitness metaverse! Unlocks upon registration.', reward: '100 XP', color: 'border-yellow-500/35 bg-yellow-500/5 text-yellow-400' },
  { key: 'hydration_goal', title: 'Hydro Champion', desc: 'Drink enough water to meet your target in a single day.', reward: '50 XP', color: 'border-sky-500/35 bg-sky-500/5 text-sky-400' },
  { key: 'streak_3', title: 'Consistent Starter', desc: 'Work out for 3 consecutive days.', reward: '50 XP', color: 'border-pink-500/35 bg-pink-500/5 text-pink-400' },
  { key: 'streak_7', title: 'Weekly Warrior', desc: 'Work out for 7 consecutive days.', reward: '150 XP', color: 'border-emerald-500/35 bg-emerald-500/5 text-emerald-400' }
];

export default function TrophiesView() {
  // Query achievements
  const { data: achievements = [], isLoading } = useQuery<any[]>({
    queryKey: ['profileAchievements'],
    queryFn: async () => {
      // Fetch user profile stats which includes profile data
      const res = await api.profile.get();
      // We can also fetch details. Let's fetch leaderboard or me.
      // Wait, we can fetch stats or profile. Profile get yields: { profile, bmi, bmiCategory }
      // To get achievements, let's query achievements? In auth getCurrentUser or logs?
      // Wait, let's see. In auth, we create achievements.
      // Let's create an endpoint in social or load from database in seed.
      // Wait, we have the user stats, we can fetch profile achievements!
      // In seed we added: "streak_3", "welcome", "hydration_goal".
      // Let's fetch them using profile or custom endpoint if needed.
      // Actually, we can fetch current profile and look at streak.
      // Let's fetch achievements list from api!
      // Wait! We didn't define a custom endpoint for achievements, but we can write a quick query or fetch from profile.
      // Let's look at `api.auth.getMe` or similar. We can fetch leaderboard or stats.
      // Let's create a quick API fetch or just look at profile which we load into authStore!
      // Yes, profile has `streak`. Let's mock the keys based on profile values if API loading is slow!
      // Even better, let's query the leaderboard or profile.
      const profileRes = await api.profile.get();
      const streak = profileRes.profile?.streak || 0;
      const xp = profileRes.profile?.xp || 0;
      const keys = ['welcome'];
      if (streak >= 3) keys.push('streak_3');
      if (streak >= 7) keys.push('streak_7');
      // For hydration, let's check if they have water intake >= target from stats
      const statsRes = await api.tracker.getStats();
      if (statsRes.waterIntake >= profileRes.profile?.waterTarget) {
        keys.push('hydration_goal');
      }
      return keys;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 3D Trophy Cabinet */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '430px' }}>
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-ping"></span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-full">
            3D Trophy Room
          </span>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <TrophyRoom3D unlockedBadges={achievements} />
        </div>
      </div>

      {/* Badges checklist panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-[#131b2e]/20 border border-slate-850 p-4 rounded-xl backdrop-blur">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" /> Badge Milestones
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Collect XP to level up. Unlock rotating 3D medallions below.</p>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
          {BADGE_MANIFEST.map((badge) => {
            const unlocked = achievements.includes(badge.key);
            return (
              <div 
                key={badge.key} 
                className={`border p-4 rounded-xl flex items-start justify-between gap-4 transition-all duration-300 ${
                  unlocked 
                    ? `border-slate-800/80 bg-[#131b2e]/20` 
                    : 'border-slate-800/40 bg-slate-900/10 opacity-60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-extrabold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {badge.title}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      +{badge.reward}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{badge.desc}</p>
                </div>

                <div className="mt-1">
                  {unlocked ? (
                    <div className="p-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="p-1 text-slate-500 bg-slate-950/80 border border-slate-800 rounded-full">
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
