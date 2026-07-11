'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Gym3D from '../three/Gym3D';
import Avatar3D from '../three/Avatar3D';
import { Play, Pause, Square, CheckCircle, Flame, Clock, Award } from 'lucide-react';

export default function GymView() {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  // Setup form states
  const [duration, setDuration] = useState('10'); // minutes
  const [weight, setWeight] = useState('20'); // kg
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState('3');

  // Active workout tracking state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Log workout mutation
  const logWorkoutMutation = useMutation({
    mutationFn: (data: any) => api.workouts.log(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      resetWorkoutState();
    }
  });

  const handleSelectEquipment = (equipment: string) => {
    setSelectedEquipment(equipment);
    setIsActive(false);
  };

  const startWorkout = () => {
    const mins = parseInt(duration) || 5;
    const secs = mins * 60;
    setTimeLeft(secs);
    setTotalSeconds(secs);
    setCurrentSet(1);
    setIsActive(true);
    setIsPaused(false);
  };

  // Timer Tick hook
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleWorkoutComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleWorkoutComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const calculatedCalories = Math.round(parseInt(duration) * (selectedEquipment === 'Treadmill' ? 10 : 8) + (parseInt(weight) * 0.1));

    // Construct completed exercise logs
    const mockExercises = [
      {
        name: selectedEquipment || 'Workout',
        sets: Array.from({ length: parseInt(sets) }).map((_, i) => ({
          reps: parseInt(reps),
          weight: selectedEquipment === 'Treadmill' || selectedEquipment === 'Spin Bike' ? 0 : parseInt(weight),
          completed: true
        }))
      }
    ];

    logWorkoutMutation.mutate({
      workoutName: `${selectedEquipment || 'Gym'} Session`,
      duration: parseInt(duration),
      caloriesBurned: calculatedCalories,
      exercises: mockExercises,
      notes: `Completed at FitVerse virtual 3D gym using the ${selectedEquipment}.`
    });
  };

  const resetWorkoutState = () => {
    setIsActive(false);
    setIsPaused(false);
    setSelectedEquipment(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine avatar animation based on active equipment
  const getAvatarAnimation = () => {
    if (isPaused) return 'idle';
    switch (selectedEquipment) {
      case 'Treadmill':
        return 'running';
      case 'Spin Bike':
        return 'running';
      case 'Bench Press':
        return 'squatting'; // pushups/squats mimic weights lifts well
      case 'Dumbbells':
        return 'squatting';
      default:
        return 'idle';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {/* 3D Visualizer Panel */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '450px' }}>
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-full">
            {isActive ? 'Active 3D Avatar Performance' : 'FitVerse 3D Virtual Gym'}
          </span>
        </div>

        {/* Dynamic 3D Renders */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          {isActive ? (
            <Avatar3D 
              type={profile?.avatarType || 'fit'} 
              activeAnimation={getAvatarAnimation()} 
            />
          ) : (
            <Gym3D onSelectEquipment={handleSelectEquipment} />
          )}
        </div>
      </div>

      {/* Control Drawer / Panel */}
      <div className="lg:col-span-4 space-y-6">
        {selectedEquipment ? (
          <div className="bg-[#131b2e]/40 border border-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-xl flex flex-col justify-between h-full min-h-[400px]">
            {/* Active exercise countdown */}
            {isActive ? (
              <div className="space-y-8 flex flex-col justify-between flex-1">
                <div className="text-center">
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
                    Active: {selectedEquipment}
                  </span>
                  {/* Timer Display */}
                  <h2 className="text-6xl font-black text-white mt-6 tracking-wider font-mono">
                    {formatTime(timeLeft)}
                  </h2>
                  
                  {/* Progress Line */}
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-6">
                    <div 
                      className="bg-gradient-to-r from-sky-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((totalSeconds - timeLeft) / totalSeconds) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Workout facts */}
                <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-400" /> Target Duration</span>
                    <span className="font-bold text-white">{duration} mins</span>
                  </div>
                  {(selectedEquipment === 'Bench Press' || selectedEquipment === 'Dumbbells') && (
                    <>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-400" /> Lift Weight</span>
                        <span className="font-bold text-white">{weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Target Reps</span>
                        <span className="font-bold text-white">{sets} sets x {reps} reps</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-pink-400" /> Est. Calories Burned</span>
                    <span className="font-bold text-pink-400">
                      {Math.round(parseInt(duration) * (selectedEquipment === 'Treadmill' ? 10 : 8) + (parseInt(weight) * 0.1))} kcal
                    </span>
                  </div>
                </div>

                {/* Buttons controls */}
                <div className="flex gap-2">
                  <button
                    onClick={togglePause}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm flex justify-center items-center gap-2 transition active:scale-[0.98]"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={handleWorkoutComplete}
                    disabled={logWorkoutMutation.isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-xl text-sm flex justify-center items-center gap-2 shadow shadow-emerald-500/25 transition active:scale-[0.98]"
                  >
                    {logWorkoutMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Square className="h-4 w-4" /> Finish
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Workout Configuration Setup
              <div className="space-y-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    🏃‍♂️ {selectedEquipment} Workout Setup
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure your targets to generate XP logs.</p>
                </div>

                <div className="space-y-4">
                  {/* Duration picker */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-400 mb-1.5">Workout Duration (minutes)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="5">Quick Session (5 mins)</option>
                      <option value="10">Standard Training (10 mins)</option>
                      <option value="20">Hardcore Workout (20 mins)</option>
                      <option value="30">Endurance Push (30 mins)</option>
                      <option value="45">Ultra Sweat (45 mins)</option>
                    </select>
                  </div>

                  {/* Weights parameters if applicable */}
                  {(selectedEquipment === 'Bench Press' || selectedEquipment === 'Dumbbells') && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 mb-1">Sets</label>
                        <input
                          type="number"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                          className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 mb-1">Reps</label>
                        <input
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={resetWorkoutState}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition active:scale-[0.98]"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={startWorkout}
                    className="flex-[2] py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition active:scale-[0.98]"
                  >
                    🚀 Start Workout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#131b2e]/40 border border-slate-800/80 backdrop-blur p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center h-full min-h-[400px]">
            <div className="inline-flex p-4 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-4 animate-bounce">
              <Flame className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Start a Workout</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-2">
              Select one of the glowing interactive gym machines in the 3D grid layout on the left to initialize a simulated tracking timer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
