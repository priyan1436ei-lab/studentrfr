import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';

// FOOD NUTRITION LOGGING
export const getFoodLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        loggedAt: { gte: today }
      },
      orderBy: { loggedAt: 'asc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Get Food Logs Error:', error);
    res.status(500).json({ error: 'Server error fetching food logs.' });
  }
};

export const logFood = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { mealType, name, calories, protein, carbs, fat, amount } = req.body;

    if (!mealType || !name || !calories) {
      return res.status(400).json({ error: 'Please provide mealType, name, and calories.' });
    }

    const foodLog = await prisma.foodLog.create({
      data: {
        userId: userId!,
        mealType,
        name,
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        amount: amount ? parseFloat(amount) : 100,
        loggedAt: new Date()
      }
    });

    // Add small XP reward
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      const newXp = profile.xp + 10;
      await prisma.profile.update({
        where: { userId },
        data: {
          xp: newXp,
          level: Math.floor(newXp / 1000) + 1
        }
      });
    }

    res.status(201).json(foodLog);
  } catch (error) {
    console.error('Log Food Error:', error);
    res.status(500).json({ error: 'Server error logging food.' });
  }
};

// WATER HYDRATION LOGGING
export const getWaterLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: today }
      }
    });

    res.json(logs);
  } catch (error) {
    console.error('Get Water Logs Error:', error);
    res.status(500).json({ error: 'Server error fetching water logs.' });
  }
};

export const logWater = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Please provide a valid water amount in ml.' });
    }

    const waterLog = await prisma.waterLog.create({
      data: {
        userId: userId!,
        amount: parseInt(amount),
        loggedAt: new Date()
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTotalLogs = await prisma.waterLog.aggregate({
      where: {
        userId,
        loggedAt: { gte: today }
      },
      _sum: { amount: true }
    });

    const dailyTotal = dailyTotalLogs._sum.amount || 0;
    const profile = await prisma.profile.findUnique({ where: { userId } });

    let xpGained = 5;
    let unlockedBadge = null;

    if (profile && dailyTotal >= profile.waterTarget) {
      // Check if they already unlocked it today
      const alreadyAwarded = await prisma.achievement.findFirst({
        where: {
          userId,
          badgeKey: 'hydration_goal',
          unlockedAt: { gte: today }
        }
      });

      if (!alreadyAwarded) {
        await prisma.achievement.create({
          data: {
            userId: userId!,
            badgeKey: 'hydration_goal',
            title: 'Hydro Champion',
            description: 'Reached your daily water hydration goal!'
          }
        });
        xpGained += 50; // daily goal completion bonus
        unlockedBadge = 'Hydro Champion';
      }
    }

    if (profile) {
      const newXp = profile.xp + xpGained;
      await prisma.profile.update({
        where: { userId },
        data: {
          xp: newXp,
          level: Math.floor(newXp / 1000) + 1
        }
      });
    }

    res.status(201).json({
      waterLog,
      dailyTotal,
      xpGained,
      unlockedBadge
    });
  } catch (error) {
    console.error('Log Water Error:', error);
    res.status(500).json({ error: 'Server error logging water.' });
  }
};

// SLEEP LOGGING
export const getSleepLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const logs = await prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 7
    });

    res.json(logs);
  } catch (error) {
    console.error('Get Sleep Logs Error:', error);
    res.status(500).json({ error: 'Server error fetching sleep logs.' });
  }
};

export const logSleep = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { sleepTime, wakeTime, qualityScore } = req.body;

    if (!sleepTime || !wakeTime || !qualityScore) {
      return res.status(400).json({ error: 'Please provide sleepTime, wakeTime, and qualityScore.' });
    }

    const start = new Date(sleepTime);
    const end = new Date(wakeTime);
    const duration = parseFloat(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1));

    if (duration <= 0) {
      return res.status(400).json({ error: 'Wake time must be after sleep time.' });
    }

    const sleepLog = await prisma.sleepLog.create({
      data: {
        userId: userId!,
        sleepTime: start,
        wakeTime: end,
        duration,
        qualityScore: parseInt(qualityScore),
        loggedAt: new Date()
      }
    });

    const profile = await prisma.profile.findUnique({ where: { userId } });
    let xpGained = 20;

    if (profile) {
      if (duration >= profile.sleepTarget - 1 && duration <= profile.sleepTarget + 1) {
        xpGained += 30; // Perfect sleep target bonus
      }
      const newXp = profile.xp + xpGained;
      await prisma.profile.update({
        where: { userId },
        data: {
          xp: newXp,
          level: Math.floor(newXp / 1000) + 1
        }
      });
    }

    res.status(201).json({ sleepLog, xpGained });
  } catch (error) {
    console.error('Log Sleep Error:', error);
    res.status(500).json({ error: 'Server error logging sleep.' });
  }
};

// STEP TRACKING
export const getStepLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const logs = await prisma.stepLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 7
    });
    res.json(logs);
  } catch (error) {
    console.error('Get Steps Error:', error);
    res.status(500).json({ error: 'Server error fetching steps.' });
  }
};

export const logSteps = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { steps } = req.body;

    if (steps === undefined || isNaN(steps)) {
      return res.status(400).json({ error: 'Please provide valid steps count.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update steps for today or create a new entry
    const existingLog = await prisma.stepLog.findFirst({
      where: {
        userId,
        loggedAt: { gte: today }
      }
    });

    let log;
    if (existingLog) {
      log = await prisma.stepLog.update({
        where: { id: existingLog.id },
        data: { steps: parseInt(steps) }
      });
    } else {
      log = await prisma.stepLog.create({
        data: {
          userId: userId!,
          steps: parseInt(steps),
          loggedAt: new Date()
        }
      });
    }

    res.json(log);
  } catch (error) {
    console.error('Log Steps Error:', error);
    res.status(500).json({ error: 'Server error logging steps.' });
  }
};

// COMPREHENSIVE STATS DASHBOARD
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get Profile
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Aggregate food calories today
    const foodSum = await prisma.foodLog.aggregate({
      where: { userId, loggedAt: { gte: today } },
      _sum: { calories: true }
    });

    // Aggregate calories burned today
    const workoutSum = await prisma.workoutLog.aggregate({
      where: { userId, completedAt: { gte: today } },
      _sum: { caloriesBurned: true }
    });

    // Aggregate water today
    const waterSum = await prisma.waterLog.aggregate({
      where: { userId, loggedAt: { gte: today } },
      _sum: { amount: true }
    });

    // Aggregate sleep duration today
    const sleepSum = await prisma.sleepLog.findFirst({
      where: { userId, loggedAt: { gte: today } },
      orderBy: { loggedAt: 'desc' }
    });

    // Aggregate steps today
    const stepsSum = await prisma.stepLog.findFirst({
      where: { userId, loggedAt: { gte: today } }
    });

    // Calculate BMI
    const heightInMeters = profile.height / 100;
    const bmi = heightInMeters > 0 ? parseFloat((profile.weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;
    let bmiCategory = 'Normal';
    if (bmi > 0) {
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    // Dynamic simulated wearable heart rate (range 65-85 depending on active workouts today)
    const activeWorkoutToday = (workoutSum._sum.caloriesBurned || 0) > 0;
    const heartRate = activeWorkoutToday ? 82 : 72;

    res.json({
      bmi,
      bmiCategory,
      currentWeight: profile.weight,
      caloriesConsumed: foodSum._sum.calories || 0,
      caloriesBurned: workoutSum._sum.caloriesBurned || 0,
      waterIntake: waterSum._sum.amount || 0,
      sleepDuration: sleepSum?.duration || 0,
      stepsCount: stepsSum?.steps || 0,
      heartRate,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Server error generating dashboard statistics.' });
  }
};
