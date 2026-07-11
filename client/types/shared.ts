export interface UserProfile {
  id: string;
  userId: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'endurance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  calorieTarget: number;
  waterTarget: number;
  sleepTarget: number;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  avatarType: 'skinny' | 'fit' | 'athletic' | 'muscular';
}

export interface Exercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  duration?: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface ExerciseSetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  name: string;
  sets: ExerciseSetLog[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId?: string | null;
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  completedAt: string;
  notes?: string;
  exercises: ExerciseLog[];
}

export interface FoodLog {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  loggedAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  amount: number;
  loggedAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  qualityScore: number;
  loggedAt: string;
}

export interface StepLog {
  id: string;
  userId: string;
  steps: number;
  loggedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeKey: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
}

export interface DashboardStats {
  bmi: number;
  bmiCategory: string;
  currentWeight: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  waterIntake: number;
  sleepDuration: number;
  stepsCount: number;
  heartRate: number;
  xp: number;
  level: number;
  streak: number;
}

export interface AIRecommendation {
  workoutProgram: {
    day: string;
    focus: string;
    exercises: string[];
  }[];
  dietPlan: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    guideline: string;
  };
  tips: string[];
  motivationalQuote: string;
}
