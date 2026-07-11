'use client';

import React, { useState } from 'react';
import BodyMap3D from '../three/BodyMap3D';
import { Dumbbell, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Exercise catalog database
const EXERCISE_CATALOG: Record<string, { name: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; desc: string; defaultReps: string }[]> = {
  Chest: [
    { name: 'Barbell Bench Press', difficulty: 'Intermediate', desc: 'Lying flat on a bench, lower a barbell to your chest and press it upward. Focuses on pectoralis major.', defaultReps: '4 sets x 8 reps' },
    { name: 'Push-Ups', difficulty: 'Beginner', desc: 'Standard bodyweight chest lift. Excellent for general chest endurance and shoulder stabilizers.', defaultReps: '3 sets x 15 reps' },
    { name: 'Incline Dumbbell Press', difficulty: 'Intermediate', desc: 'Press dumbbells upward from an inclined bench. Hits upper pectoral muscle fibers.', defaultReps: '3 sets x 10 reps' },
    { name: 'Dumbbell Chest Flyes', difficulty: 'Intermediate', desc: 'Lying flat, sweep dumbbells outward in a wide arc. Focuses on chest stretching and expansion.', defaultReps: '3 sets x 12 reps' }
  ],
  Back: [
    { name: 'Conventional Deadlift', difficulty: 'Advanced', desc: 'Lift a loaded barbell from the floor to hip height. Massive builder of the posterior chain and lower back.', defaultReps: '4 sets x 5 reps' },
    { name: 'Wide Grip Pull-Ups', difficulty: 'Intermediate', desc: 'Pull your bodyweight up to a bar. Standard builder for the latissimus dorsi (back width).', defaultReps: '3 sets x 8 reps' },
    { name: 'Bent-Over Barbell Rows', difficulty: 'Intermediate', desc: 'Hinge at the hips and pull a barbell to your stomach. Hits mid-back density and rhomboids.', defaultReps: '3 sets x 10 reps' },
    { name: 'Seated Cable Lat Pulldown', difficulty: 'Beginner', desc: 'Pull down a cable bar to chest height. Great for isolating lat muscles safely.', defaultReps: '3 sets x 12 reps' }
  ],
  Legs: [
    { name: 'Back Squat', difficulty: 'Advanced', desc: 'Lower your hips while balancing a barbell on your traps. King of lower body builders (quads, hamstrings, glutes).', defaultReps: '4 sets x 8 reps' },
    { name: 'Walking Lunges', difficulty: 'Beginner', desc: 'Step forward and bend knees. Improves unilateral leg strength and balance.', defaultReps: '3 sets x 20 steps' },
    { name: 'Romanian Deadlift', difficulty: 'Intermediate', desc: 'Hinge hips backward with slightly bent legs. Isolates hamstrings and glutes.', defaultReps: '3 sets x 10 reps' },
    { name: 'Leg Press Machine', difficulty: 'Beginner', desc: 'Press a sled sled upward using quadriceps power. Safe isolation for leg growth.', defaultReps: '3 sets x 12 reps' }
  ],
  Biceps: [
    { name: 'Standing Barbell Curl', difficulty: 'Beginner', desc: 'Curl a barbell up towards shoulders. Key builder for overall biceps brachii mass.', defaultReps: '3 sets x 10 reps' },
    { name: 'Dumbbell Hammer Curl', difficulty: 'Beginner', desc: 'Curl dumbbells with a neutral grip (palms facing). Targets forearm brachioradialis and biceps width.', defaultReps: '3 sets x 12 reps' },
    { name: 'Preacher Curl Machine', difficulty: 'Intermediate', desc: 'Curl weight with elbows anchored on an angled pad. Eliminates cheating/sway for complete isolation.', defaultReps: '3 sets x 10 reps' }
  ],
  Triceps: [
    { name: 'Cable Rope Pushdowns', difficulty: 'Beginner', desc: 'Push a cable attachment down using tricep power. Hits the lateral head of the tricep.', defaultReps: '3 sets x 12 reps' },
    { name: 'Lying Tricep Extensions (Skull Crushers)', difficulty: 'Intermediate', desc: 'Extend elbows upward from a lying position. Excellent for long-head tricep growth.', defaultReps: '3 sets x 10 reps' },
    { name: 'Overhead Dumbbell Extension', difficulty: 'Beginner', desc: 'Lower a single dumbbell behind your head and press it upward. Focuses on full extension stretching.', defaultReps: '3 sets x 12 reps' }
  ],
  Shoulders: [
    { name: 'Overhead Barbell Press', difficulty: 'Advanced', desc: 'Press a barbell overhead while standing. Key builder for anterior deltoids and core stability.', defaultReps: '4 sets x 6 reps' },
    { name: 'Lateral Dumbbell Raise', difficulty: 'Beginner', desc: 'Raise dumbbells out to the sides. Isolates lateral deltoids to create shoulder width.', defaultReps: '3 sets x 15 reps' },
    { name: 'Rear Delt Face Pulls', difficulty: 'Beginner', desc: 'Pull a cable rope toward your face, splitting hands. Corrects posture and builds rear delts.', defaultReps: '3 sets x 15 reps' }
  ],
  Abs: [
    { name: 'Plank Hold', difficulty: 'Beginner', desc: 'Support body weight on forearms and toes in a straight line. Core isometric strength builder.', defaultReps: '3 sets x 60s hold' },
    { name: 'Hanging Knee Raises', difficulty: 'Intermediate', desc: 'Hang from a bar and raise knees to chest. Hits lower abs and hip flexors.', defaultReps: '3 sets x 15 reps' },
    { name: 'Russian Twist', difficulty: 'Beginner', desc: 'Twist torso side-to-side while sitting on the floor. Hits obliques and core rotation.', defaultReps: '3 sets x 20 reps' }
  ]
};

export default function MuscleMapView() {
  const queryClient = useQueryClient();
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Chest');

  // Quick log mutation
  const logMutation = useMutation({
    mutationFn: (exerciseName: string) => {
      // Log as a quick 1-set exercise
      const mockExercises = [
        {
          name: exerciseName,
          sets: [{ reps: 10, weight: 20, completed: true }]
        }
      ];
      return api.workouts.log({
        workoutName: `Quick ${exerciseName}`,
        duration: 5,
        caloriesBurned: 40,
        exercises: mockExercises,
        notes: 'Logged quickly from the 3D Muscle Map library.'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
      alert('Exercise logged successfully! +100 XP gained.');
    }
  });

  const exercises = EXERCISE_CATALOG[selectedMuscle] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Clickable 3D Body Model */}
      <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '430px' }}>
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping"></span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-full">
            3D Anatomy Visualizer
          </span>
        </div>

        <div className="flex-1 w-full flex items-center justify-center">
          <BodyMap3D onSelectMuscle={(m) => setSelectedMuscle(m)} />
        </div>
      </div>

      {/* Exercises catalog panel */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex justify-between items-center bg-[#131b2e]/20 border border-slate-850 p-4 rounded-xl backdrop-blur">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-pink-400" /> {selectedMuscle} Exercise Library
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click muscles on the 3D model to change categories.</p>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
          {exercises.map((ex, idx) => (
            <div 
              key={idx} 
              className="bg-[#131b2e]/30 border border-slate-800/80 p-4 rounded-xl hover:border-pink-500/30 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    ex.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    ex.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ex.desc}</p>
                <div className="text-[10px] text-pink-400 font-bold bg-pink-500/5 border border-pink-500/10 px-2 py-0.5 rounded-md inline-block">
                  Standard: {ex.defaultReps}
                </div>
              </div>

              <button
                onClick={() => logMutation.mutate(ex.name)}
                disabled={logMutation.isPending}
                className="py-2 px-3 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-800 text-white font-bold rounded-lg text-xs shadow shadow-pink-500/20 active:scale-[0.98] transition flex items-center gap-1.5 self-end md:self-auto"
              >
                <PlusCircle className="h-4 w-4" /> Log Lift
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
