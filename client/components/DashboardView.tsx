'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  Droplet, 
  Flame, 
  Moon, 
  Footprints, 
  Activity, 
  TrendingUp, 
  Plus, 
  Utensils, 
  Calculator 
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardView() {
  const queryClient = useQueryClient();
  const { updateStatsState, stats, profile } = useAuthStore();

  // Modal / Inputs state
  const [waterAmount, setWaterAmount] = useState('250');
  const [stepsInput, setStepsInput] = useState('5000');
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepQuality, setSleepQuality] = useState('80');

  // Food inputs state
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  // Fetch Dashboard Stats
  const { isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.tracker.getStats();
      updateStatsState(res);
      return res;
    }
  });

  // Mutators
  const waterMutation = useMutation({
    mutationFn: (amount: number) => api.tracker.logWater(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const foodMutation = useMutation({
    mutationFn: (data: any) => api.tracker.logFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setFoodName('');
      setFoodCalories('');
      setFoodProtein('');
      setFoodCarbs('');
      setFoodFat('');
    }
  });

  const stepsMutation = useMutation({
    mutationFn: (steps: number) => api.tracker.logSteps(steps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }
  });

  const sleepMutation = useMutation({
    mutationFn: (data: any) => api.tracker.logSleep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setSleepStart('');
      setSleepEnd('');
    }
  });

  // Handle submissions
  const handleLogWater = (e: React.FormEvent) => {
    e.preventDefault();
    waterMutation.mutate(parseInt(waterAmount));
  };

  const handleLogFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;
    foodMutation.mutate({
      mealType,
      name: foodName,
      calories: parseInt(foodCalories),
      protein: parseFloat(foodProtein || '0'),
      carbs: parseFloat(foodCarbs || '0'),
      fat: parseFloat(foodFat || '0'),
      amount: 100
    });
  };

  const handleLogSteps = (e: React.FormEvent) => {
    e.preventDefault();
    stepsMutation.mutate(parseInt(stepsInput));
  };

  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepStart || !sleepEnd) return;
    sleepMutation.mutate({
      sleepTime: new Date(sleepStart).toISOString(),
      wakeTime: new Date(sleepEnd).toISOString(),
      qualityScore: parseInt(sleepQuality)
    });
  };

  // Mock data for Recharts
  const weeklyBurnData = [
    { day: 'Mon', burned: 350, consumed: 2100 },
    { day: 'Tue', burned: 500, consumed: 1950 },
    { day: 'Wed', burned: 200, consumed: 2200 },
    { day: 'Thu', burned: 620, consumed: 1800 },
    { day: 'Fri', burned: 450, consumed: 2050 },
    { day: 'Sat', burned: 800, consumed: 2400 },
    { day: 'Sun', burned: stats?.caloriesBurned || 150, consumed: stats?.caloriesConsumed || 1500 }
  ];

  const weightProgressData = [
    { month: 'Mar', weight: (profile?.weight || 70) + 4 },
    { month: 'Apr', weight: (profile?.weight || 70) + 2.5 },
    { month: 'May', weight: (profile?.weight || 70) + 1.2 },
    { month: 'Jun', weight: (profile?.weight || 70) }
  ];

  const waterHistoryData = [
    { day: 'Mon', amount: 2000 },
    { day: 'Tue', amount: 2250 },
    { day: 'Wed', amount: 1500 },
    { day: 'Thu', amount: 2500 },
    { day: 'Fri', amount: 2750 },
    { day: 'Sat', amount: 1800 },
    { day: 'Sun', amount: stats?.waterIntake || 0 }
  ];

  // Calorie ring data
  const consumedVal = stats?.caloriesConsumed || 0;
  const targetVal = profile?.calorieTarget || 2000;
  const remainingVal = Math.max(0, targetVal - consumedVal);
  
  const calorieRingData = [
    { name: 'Consumed', value: consumedVal, color: '#ec4899' },
    { name: 'Remaining', value: remainingVal, color: '#334155' }
  ];

  if (statsLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center text-sky-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: BMI */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 text-emerald-500 bg-emerald-500/5 rounded-bl-xl border-l border-b border-emerald-500/10">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BMI Index</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.bmi}</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-4 self-start">
            {stats.bmiCategory}
          </span>
        </div>

        {/* Card 2: Calorie balance */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 text-pink-500 bg-pink-500/5 rounded-bl-xl border-l border-b border-pink-500/10">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calories Burned</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.caloriesBurned} kcal</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Consumed: <span className="text-pink-400 font-bold">{stats.caloriesConsumed} kcal</span>
          </p>
        </div>

        {/* Card 3: Water Tracker */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 text-sky-500 bg-sky-500/5 rounded-bl-xl border-l border-b border-sky-500/10">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hydration</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.waterIntake} ml</h3>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4">
            <div 
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (stats.waterIntake / (profile?.waterTarget || 2500)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Sleep duration */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 text-indigo-500 bg-indigo-500/5 rounded-bl-xl border-l border-b border-indigo-500/10">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sleep Logs</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.sleepDuration} hrs</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Target: <span className="text-indigo-400 font-bold">{profile?.sleepTarget} hrs</span>
          </p>
        </div>

        {/* Card 5: Step count & Wearable */}
        <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 text-amber-500 bg-amber-500/5 rounded-bl-xl border-l border-b border-amber-500/10">
            <Footprints className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Steps Active</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.stepsCount}</h3>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10 self-start animate-pulse">
            <Activity className="h-3.5 w-3.5 text-red-500" /> Pulse: {stats.heartRate} bpm
          </div>
        </div>
      </div>

      {/* Logger inputs grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Water & Steps Log */}
        <div className="space-y-6">
          {/* Water Intake Form */}
          <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-xl backdrop-blur relative">
            <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
              <Droplet className="h-4 w-4 text-sky-400" /> Log Water Hydration
            </h4>
            <form onSubmit={handleLogWater} className="flex gap-2">
              <select 
                value={waterAmount} 
                onChange={(e) => setWaterAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="150">Small Glass (150ml)</option>
                <option value="250">Standard Cup (250ml)</option>
                <option value="500">Sport Bottle (500ml)</option>
                <option value="750">Thermos (750ml)</option>
                <option value="1000">Big Pitcher (1000ml)</option>
              </select>
              <button 
                type="submit" 
                disabled={waterMutation.isPending}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-sm shadow shadow-sky-500/20 active:scale-[0.98] transition flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </form>
          </div>

          {/* Steps Form */}
          <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-xl backdrop-blur">
            <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
              <Footprints className="h-4 w-4 text-amber-400" /> Log Steps Counter
            </h4>
            <form onSubmit={handleLogSteps} className="flex gap-2">
              <input
                type="number"
                placeholder="Logged Steps (e.g. 8500)"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                required
                min="0"
                className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={stepsMutation.isPending}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm shadow shadow-amber-500/20 active:scale-[0.98] transition flex items-center gap-1.5"
              >
                Sync
              </button>
            </form>
          </div>
        </div>

        {/* Col 2: Nutrition Log */}
        <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-xl backdrop-blur">
          <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
            <Utensils className="h-4 w-4 text-pink-400" /> Log Daily Meal Item
          </h4>
          <form onSubmit={handleLogFood} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={mealType}
                onChange={(e: any) => setMealType(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <input
                type="text"
                placeholder="Food item name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
                className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Calories</label>
                <input
                  type="number"
                  placeholder="kcal"
                  value={foodCalories}
                  onChange={(e) => setFoodCalories(e.target.value)}
                  required
                  min="0"
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Protein (g)</label>
                <input
                  type="number"
                  placeholder="Pro"
                  value={foodProtein}
                  onChange={(e) => setFoodProtein(e.target.value)}
                  min="0"
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Carbs (g)</label>
                <input
                  type="number"
                  placeholder="Carb"
                  value={foodCarbs}
                  onChange={(e) => setFoodCarbs(e.target.value)}
                  min="0"
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Fat (g)</label>
                <input
                  type="number"
                  placeholder="Fat"
                  value={foodFat}
                  onChange={(e) => setFoodFat(e.target.value)}
                  min="0"
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={foodMutation.isPending}
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-lg text-xs shadow shadow-pink-500/25 active:scale-[0.98] transition flex justify-center items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Log Meal
            </button>
          </form>
        </div>

        {/* Col 3: Sleep Log */}
        <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-xl backdrop-blur">
          <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 mb-4 flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-400" /> Log Sleep Quality
          </h4>
          <form onSubmit={handleLogSleep} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Sleep Time</label>
                <input
                  type="datetime-local"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  required
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-500 font-bold mb-1">Wake Time</label>
                <input
                  type="datetime-local"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                  required
                  className="px-2 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-500 font-bold">Quality Score ({sleepQuality}%)</label>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={sleepMutation.isPending}
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-lg text-xs shadow shadow-indigo-500/25 active:scale-[0.98] transition flex justify-center items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Save Sleep Session
            </button>
          </form>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Calorie Intake vs Remaining Ring */}
        <div className="bg-[#131b2e]/20 border border-slate-800 p-5 rounded-xl flex flex-col items-center justify-between min-h-[300px]">
          <h4 className="text-sm font-bold text-slate-200 self-start border-b border-slate-800/80 pb-2 mb-2 w-full">
            Calorie Target Status
          </h4>
          <div className="relative w-full h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calorieRingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {calorieRingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{consumedVal}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">of {targetVal} kcal</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-bold w-full justify-center">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div> Consumed</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-700 rounded-full"></div> Remaining ({remainingVal} kcal)</div>
          </div>
        </div>

        {/* Weekly Calories Burn vs Consume */}
        <div className="bg-[#131b2e]/20 border border-slate-800 p-5 rounded-xl min-h-[300px]">
          <h4 className="text-sm font-bold text-slate-200 border-b border-slate-800/80 pb-2 mb-4">
            Weekly Activity Frequency
          </h4>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBurnData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="burned" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Burned (kcal)" />
                <Bar dataKey="consumed" fill="#ec4899" radius={[4, 4, 0, 0]} name="Consumed (kcal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hydration Area Chart & Weight Trend */}
        <div className="bg-[#131b2e]/20 border border-slate-800 p-5 rounded-xl min-h-[300px]">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-4">
            <h4 className="text-sm font-bold text-slate-200">
              Hydration Intake History
            </h4>
            <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full">Goal: {profile?.waterTarget}ml</span>
          </div>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waterHistoryData}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                <Area type="monotone" dataKey="amount" stroke="#0284c7" fillOpacity={1} fill="url(#colorWater)" name="Water (ml)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
