import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    // Calculate BMI
    const heightInMeters = profile.height / 100;
    const bmi = heightInMeters > 0 ? parseFloat((profile.weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;
    let bmiCategory = 'Unknown';
    if (bmi > 0) {
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    res.json({
      profile,
      bmi,
      bmiCategory
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const {
      gender,
      age,
      height,
      weight,
      fitnessGoal,
      activityLevel,
      calorieTarget,
      waterTarget,
      sleepTarget,
      avatarType
    } = req.body;

    const currentProfile = await prisma.profile.findUnique({ where: { userId } });
    if (!currentProfile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    // Trigger gamification XP for completing profile updates
    let xpGained = 0;
    const isFirstSetup = currentProfile.height === 170 && currentProfile.weight === 70 && currentProfile.age === 25;
    if (isFirstSetup) {
      xpGained = 150; // Welcome profile setup XP
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        gender: gender ?? currentProfile.gender,
        age: age ? parseInt(age) : currentProfile.age,
        height: height ? parseFloat(height) : currentProfile.height,
        weight: weight ? parseFloat(weight) : currentProfile.weight,
        fitnessGoal: fitnessGoal ?? currentProfile.fitnessGoal,
        activityLevel: activityLevel ?? currentProfile.activityLevel,
        calorieTarget: calorieTarget ? parseInt(calorieTarget) : currentProfile.calorieTarget,
        waterTarget: waterTarget ? parseInt(waterTarget) : currentProfile.waterTarget,
        sleepTarget: sleepTarget ? parseFloat(sleepTarget) : currentProfile.sleepTarget,
        avatarType: avatarType ?? currentProfile.avatarType,
        xp: currentProfile.xp + xpGained,
        level: Math.floor((currentProfile.xp + xpGained) / 1000) + 1
      }
    });

    // Check level up achievement
    if (Math.floor(updatedProfile.xp / 1000) + 1 > currentProfile.level) {
      await prisma.achievement.create({
        data: {
          userId: userId!,
          badgeKey: `level_${updatedProfile.level}`,
          title: `Level ${updatedProfile.level} Champion`,
          description: `Reached Level ${updatedProfile.level} in FitVerse.`
        }
      });
    }

    // Calculate updated BMI
    const heightInMeters = updatedProfile.height / 100;
    const bmi = heightInMeters > 0 ? parseFloat((updatedProfile.weight / (heightInMeters * heightInMeters)).toFixed(1)) : 0;
    let bmiCategory = 'Unknown';
    if (bmi > 0) {
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi < 25) bmiCategory = 'Normal';
      else if (bmi < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obese';
    }

    res.json({
      message: 'Profile updated successfully!',
      profile: updatedProfile,
      bmi,
      bmiCategory,
      xpGained
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
};
