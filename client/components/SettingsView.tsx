'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User, Target, Settings, ShieldCheck } from 'lucide-react';

export default function SettingsView() {
  const queryClient = useQueryClient();
  const { profile, updateProfileState } = useAuthStore();

  // Settings states
  const [gender, setGender] = useState('other');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [fitnessGoal, setFitnessGoal] = useState('maintenance');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [waterTarget, setWaterTarget] = useState('2500');
  const [sleepTarget, setSleepTarget] = useState('8.0');
  const [avatarType, setAvatarType] = useState('fit');

  // Hydrate fields on mount
  useEffect(() => {
    if (profile) {
      setGender(profile.gender || 'other');
      setAge(profile.age?.toString() || '25');
      setHeight(profile.height?.toString() || '170');
      setWeight(profile.weight?.toString() || '70');
      setFitnessGoal(profile.fitnessGoal || 'maintenance');
      setActivityLevel(profile.activityLevel || 'moderate');
      setCalorieTarget(profile.calorieTarget?.toString() || '2000');
      setWaterTarget(profile.waterTarget?.toString() || '2500');
      setSleepTarget(profile.sleepTarget?.toString() || '8.0');
      setAvatarType(profile.avatarType || 'fit');
    }
  }, [profile]);

  // Profile Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.profile.update(data),
    onSuccess: (data) => {
      // Update global Zustand store
      updateProfileState(data.profile);
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert(data.message + (data.xpGained > 0 ? ` Earned +${data.xpGained} XP!` : ''));
    },
    onError: (err: any) => {
      alert(err.message || 'Error updating settings.');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      gender,
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      fitnessGoal,
      activityLevel,
      calorieTarget: parseInt(calorieTarget),
      waterTarget: parseInt(waterTarget),
      sleepTarget: parseFloat(sleepTarget),
      avatarType
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#131b2e]/30 border border-slate-850 p-6 rounded-2xl shadow-xl backdrop-blur">
      <h3 className="text-lg font-extrabold text-white border-b border-slate-800/80 pb-3 mb-6 flex items-center gap-2">
        <Settings className="h-5 w-5 text-indigo-400" /> FitVerse Profile Settings
      </h3>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Biological Metrics */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="h-4 w-4 text-sky-400" /> 1. Body Composition & Details
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="10"
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                min="50"
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min="20"
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fitness Goals */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="h-4 w-4 text-pink-400" /> 2. Core Target Goals
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Primary Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="muscle_gain">Muscle Gain (Bulking)</option>
                <option value="fat_loss">Fat Loss (Cutting)</option>
                <option value="maintenance">Weight Maintenance</option>
                <option value="endurance">Endurance & Cardiovascular Conditioning</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Daily Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="sedentary">Sedentary (Office job, minimal activity)</option>
                <option value="light">Light Activity (1-2 workouts/week)</option>
                <option value="moderate">Moderate Activity (3-5 workouts/week)</option>
                <option value="active">High Activity (6-7 intense workouts/week)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Calorie Target (kcal)</label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Water Target (ml)</label>
              <input
                type="number"
                value={waterTarget}
                onChange={(e) => setWaterTarget(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[11px] text-slate-500 font-bold mb-1">Sleep Target (hours)</label>
              <input
                type="number"
                step="0.5"
                value={sleepTarget}
                onChange={(e) => setSleepTarget(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: 3D Avatar morph skin selection */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="h-4 w-4 text-emerald-400" /> 3. 3D Avatar Skin Customization
          </h4>
          
          <div className="flex flex-col">
            <label className="text-[11px] text-slate-500 font-bold mb-1">Mannequin Morph Target</label>
            <select
              value={avatarType}
              onChange={(e) => setAvatarType(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="skinny">Skinny (Lean, slim proportions)</option>
              <option value="fit">Fit (Balanced healthy physique)</option>
              <option value="athletic">Athletic (Broader shoulders, toned limbs)</option>
              <option value="muscular">Muscular (Bulky chest plate, dense mass)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-pink-500 hover:from-sky-400 hover:to-pink-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 active:scale-[0.98] transition flex justify-center items-center gap-1.5"
        >
          {updateMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> Save Profile Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
