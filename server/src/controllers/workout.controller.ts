import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getWorkoutPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const plans = await prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON exercises
    const parsedPlans = plans.map(p => ({
      ...p,
      exercises: JSON.parse(p.exercises)
    }));

    res.json(parsedPlans);
  } catch (error) {
    console.error('Get Workout Plans Error:', error);
    res.status(500).json({ error: 'Server error fetching plans.' });
  }
};

export const createWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, description, exercises } = req.body;

    if (!name || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Please provide name and an array of exercises.' });
    }

    const newPlan = await prisma.workoutPlan.create({
      data: {
        userId: userId!,
        name,
        description,
        exercises: JSON.stringify(exercises)
      }
    });

    res.status(201).json({
      ...newPlan,
      exercises
    });
  } catch (error) {
    console.error('Create Workout Plan Error:', error);
    res.status(500).json({ error: 'Server error creating plan.' });
  }
};

export const getWorkoutLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });

    const parsedLogs = logs.map(l => ({
      ...l,
      exercises: JSON.parse(l.exercises)
    }));

    res.json(parsedLogs);
  } catch (error) {
    console.error('Get Workout Logs Error:', error);
    res.status(500).json({ error: 'Server error fetching logs.' });
  }
};

export const logWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { planId, workoutName, duration, caloriesBurned, exercises, notes } = req.body;

    if (!workoutName || !duration || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Please provide workoutName, duration, and completed exercises.' });
    }

    const calculatedCalories = caloriesBurned ?? (duration * 8); // rough fallback: 8 calories per minute

    const log = await prisma.workoutLog.create({
      data: {
        userId: userId!,
        planId: planId || null,
        workoutName,
        duration: parseInt(duration),
        caloriesBurned: parseInt(calculatedCalories),
        exercises: JSON.stringify(exercises),
        notes,
        completedAt: new Date()
      }
    });

    // Update Streak, XP, Level in user Profile
    const profile = await prisma.profile.findUnique({ where: { userId } });
    let xpGained = 100; // Base workout XP
    let streakUpdated = profile?.streak ?? 0;

    if (profile) {
      const today = new Date().toDateString();
      const lastActive = new Date(profile.lastActiveDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastActive === yesterday) {
        streakUpdated += 1;
      } else if (lastActive !== today) {
        streakUpdated = 1; // start new streak
      }

      // Check streak achievements
      if (streakUpdated === 3) {
        await prisma.achievement.create({
          data: { userId: userId!, badgeKey: 'streak_3', title: 'Consistent Starter', description: 'Maintained a 3-day workout streak!' }
        });
        xpGained += 50;
      } else if (streakUpdated === 7) {
        await prisma.achievement.create({
          data: { userId: userId!, badgeKey: 'streak_7', title: 'Weekly Warrior', description: 'Maintained a 7-day workout streak!' }
        });
        xpGained += 150;
      }

      const totalXp = profile.xp + xpGained;
      const targetLevel = Math.floor(totalXp / 1000) + 1;

      await prisma.profile.update({
        where: { userId },
        data: {
          xp: totalXp,
          level: targetLevel,
          streak: streakUpdated,
          lastActiveDate: new Date()
        }
      });
    }

    res.status(201).json({
      message: 'Workout logged successfully!',
      log: {
        ...log,
        exercises
      },
      xpGained,
      streak: streakUpdated
    });
  } catch (error) {
    console.error('Log Workout Error:', error);
    res.status(500).json({ error: 'Server error saving workout log.' });
  }
};
