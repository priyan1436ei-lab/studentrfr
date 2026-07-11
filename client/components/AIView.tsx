'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  BrainCircuit, 
  Flame, 
  ShieldAlert, 
  Utensils, 
  CalendarDays, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AIView() {
  const { profile } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery<any>({
    queryKey: ['aiRecommendations'],
    queryFn: api.ai.getRecommendations
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-96 flex-col gap-3 items-center justify-center text-sky-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Consulting FitVerse AI Coach...</p>
      </div>
    );
  }

  const recs = data.recommendations;

  return (
    <div className="space-y-6">
      {/* Motivational Quote Header */}
      <div className="bg-gradient-to-r from-indigo-900/30 via-slate-900/40 to-pink-900/30 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Decorative background light */}
        <div className="absolute top-0 left-[20%] w-[30%] h-[150%] bg-indigo-500/10 rotate-12 blur-[80px] pointer-events-none"></div>
        
        <div className="space-y-1.5 z-10 flex-1">
          <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin" /> AI Coach Wisdom
          </span>
          <h2 className="text-xl font-extrabold italic text-slate-100 tracking-tight mt-3">
            "{recs.motivationalQuote}"
          </h2>
          <p className="text-xs text-slate-500 mt-1">— Personalized FitVerse Trainer</p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-bold rounded-xl text-xs active:scale-[0.98] transition flex items-center gap-1.5 shadow-md z-10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Re-analyzing...' : 'Refresh Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Weekly Program Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#131b2e]/20 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5 text-indigo-400" /> Weekly Workout Routine Recommendations
            </h3>
          </div>

          <div className="space-y-3.5">
            {recs.workoutProgram.map((prog: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-[#131b2e]/30 border border-slate-800/80 p-4 rounded-xl space-y-2.5 hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-0.5 rounded-full">
                    {prog.day}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Focus: {prog.focus}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {prog.exercises.map((ex: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400 bg-slate-950/20 px-3 py-2 rounded-lg border border-slate-850">
                      <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Diet Plan & Advice */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Diet Target */}
          <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
              <Utensils className="h-4.5 w-4.5 text-pink-400" /> AI Diet Guidelines
            </h4>
            
            <div className="space-y-4">
              {/* Daily Calories */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                  <span>Target Intake</span>
                  <span className="text-pink-400 text-sm font-extrabold">{recs.dietPlan.calories} kcal</span>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Protein</p>
                  <h4 className="text-sm font-extrabold text-white mt-1">{recs.dietPlan.protein}g</h4>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Carbs</p>
                  <h4 className="text-sm font-extrabold text-white mt-1">{recs.dietPlan.carbs}g</h4>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Fat</p>
                  <h4 className="text-sm font-extrabold text-white mt-1">{recs.dietPlan.fat}g</h4>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-850">
                {recs.dietPlan.guideline}
              </p>
            </div>
          </div>

          {/* Injury prevention advice */}
          <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-2xl shadow-lg">
            <h4 className="text-sm font-extrabold text-white border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" /> Preventative Tips
            </h4>
            <div className="space-y-3.5">
              {recs.tips.map((tip: string, idx: number) => (
                <div key={idx} className="flex gap-2.5 text-xs text-slate-400">
                  <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
