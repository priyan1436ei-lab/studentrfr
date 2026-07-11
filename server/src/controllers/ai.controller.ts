import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIRecommendation } from '../types/shared';

// Fallback Mock AI Engine
const generateLocalRecommendations = (
  goal: string,
  weight: number,
  height: number,
  age: number
): AIRecommendation => {
  const heightInM = height / 100;
  const bmi = heightInM > 0 ? (weight / (heightInM * heightInM)) : 22;

  let calorieTarget = 2000;
  let protein = 120;
  let carbs = 220;
  let fat = 65;
  let program: { day: string; focus: string; exercises: string[] }[] = [];
  let tips: string[] = [];
  let quote = "The only bad workout is the one that didn't happen.";

  if (goal === 'muscle_gain') {
    calorieTarget = Math.round(weight * 35 + 300);
    protein = Math.round(weight * 2.0);
    fat = Math.round((calorieTarget * 0.25) / 9);
    carbs = Math.round((calorieTarget - (protein * 4) - (fat * 9)) / 4);

    program = [
      { day: 'Monday', focus: 'Chest & Triceps', exercises: ['Bench Press (4 sets x 8 reps)', 'Incline Dumbbell Flyes (3 sets x 10 reps)', 'Tricep Rope Pushdowns (3 sets x 12 reps)', 'Push-ups (3 sets x Failure)'] },
      { day: 'Tuesday', focus: 'Back & Biceps', exercises: ['Deadlifts (4 sets x 5 reps)', 'Lat Pulldowns (3 sets x 10 reps)', 'Barbell Bicep Curls (3 sets x 8 reps)', 'Hammer Curls (3 sets x 12 reps)'] },
      { day: 'Wednesday', focus: 'Active Recovery', exercises: ['Light Stretch/Yoga (20 mins)', 'Steady State Hydration Intake'] },
      { day: 'Thursday', focus: 'Legs & Shoulders', exercises: ['Barbell Squats (4 sets x 8 reps)', 'Overhead Shoulder Press (3 sets x 8 reps)', 'Leg Press (3 sets x 12 reps)', 'Lateral Dumbbell Raises (3 sets x 15 reps)'] },
      { day: 'Friday', focus: 'Core & Cardio Finish', exercises: ['Hanging Leg Raises (3 sets x 15 reps)', 'Plank Holds (3 sets x 60s)', 'HIIT Sprint Runs (15 mins)'] }
    ];

    tips = [
      "Prioritize progressive overload. Try to increase weights or reps slightly each week.",
      "Eat a protein-rich meal within 2 hours post-workout to support muscle protein synthesis.",
      "Get at least 8 hours of sleep; muscles grow during rest, not during lifting."
    ];
    quote = "Focus on the reps today, see the growth tomorrow. Strive for strength.";
  } else if (goal === 'fat_loss') {
    calorieTarget = Math.round(weight * 28 - 400);
    protein = Math.round(weight * 2.2); // high protein to spare muscle
    fat = Math.round((calorieTarget * 0.22) / 9);
    carbs = Math.round((calorieTarget - (protein * 4) - (fat * 9)) / 4);

    program = [
      { day: 'Monday', focus: 'Full Body HIIT & Cardio', exercises: ['Kettlebell Swings (4 sets x 15 reps)', 'Burpees (4 sets x 12 reps)', 'Jump Squats (3 sets x 15 reps)', 'Treadmill Incline Run (15 mins)'] },
      { day: 'Tuesday', focus: 'Upper Body Conditioning', exercises: ['Dumbbell Chest Press (3 sets x 15 reps)', 'Dumbbell Rows (3 sets x 15 reps)', 'Dumbbell Shoulder Press (3 sets x 12 reps)', 'Plank Shoulder Taps (3 sets x 20 reps)'] },
      { day: 'Wednesday', focus: 'Rest & Hydrate', exercises: ['Yoga Mobility Work (30 mins)', 'Water hydration target: 3L+'] },
      { day: 'Thursday', focus: 'Lower Body Strength & Cardio', exercises: ['Goblet Squats (4 sets x 15 reps)', 'Walking Lunges (3 sets x 20 steps)', 'Glute Bridges (3 sets x 15 reps)', 'Elliptical Sprint intervals (15 mins)'] },
      { day: 'Friday', focus: 'Core & Ab Core Burner', exercises: ['Russian Twists (3 sets x 20 reps)', 'Mountain Climbers (3 sets x 30s)', 'Bicycle Crunches (3 sets x 20 reps)'] }
    ];

    tips = [
      "Stay in a consistent caloric deficit while maintaining high protein intake to preserve lean mass.",
      "Increase non-exercise activity thermogenesis (NEAT) by hitting a target of 10,000 steps daily.",
      "Drink a glass of water before meals to naturally regulate portion control."
    ];
    quote = "Sweat is just fat crying. Every calorie burned brings you closer to your target.";
  } else {
    // endurance / maintenance
    calorieTarget = Math.round(weight * 31);
    protein = Math.round(weight * 1.6);
    fat = Math.round((calorieTarget * 0.25) / 9);
    carbs = Math.round((calorieTarget - (protein * 4) - (fat * 9)) / 4);

    program = [
      { day: 'Monday', focus: 'Cardio Core', exercises: ['Stair Climber (20 mins)', 'Plank Holds (3 sets x 60s)', 'Flutter Kicks (3 sets x 20 reps)'] },
      { day: 'Tuesday', focus: 'Functional Strength', exercises: ['Dumbbell Goblet Squats (3 sets x 12 reps)', 'Push-ups (3 sets x 15 reps)', 'Cable Lat Pulldowns (3 sets x 12 reps)'] },
      { day: 'Wednesday', focus: 'Stretching & Yoga', exercises: ['Deep Vinyasa Yoga (30 mins)'] },
      { day: 'Thursday', focus: 'Aerobic Long Run', exercises: ['Steady State Outdoor Running (35 mins)', 'Post-run leg stretches'] },
      { day: 'Friday', focus: 'Full Body Mobility', exercises: ['Bodyweight Squats (3 sets x 15 reps)', 'Supermans (3 sets x 12 reps)', 'Dead Bugs (3 sets x 10 reps)'] }
    ];

    tips = [
      "Maintain hydration. Dehydration can reduce training capacity by up to 20%.",
      "Focus on mobility work. Flexibility reduces muscle tightness and joint strains.",
      "Incorporate complex carbs (oats, brown rice) to maintain stable glycogen reserves."
    ];
    quote = "Consistency is the compound interest of self-improvement. Keep moving.";
  }

  return {
    workoutProgram: program,
    dietPlan: {
      calories: calorieTarget,
      protein,
      carbs,
      fat,
      guideline: `Tailored diet plan optimized for ${goal.replace('_', ' ')}.`
    },
    tips,
    motivationalQuote: quote
  };
};

export const getAIRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const profile = await prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return beautiful local recommendation instantly
      const localRecs = generateLocalRecommendations(
        profile.fitnessGoal,
        profile.weight,
        profile.height,
        profile.age
      );
      return res.json({
        source: 'local_heuristics',
        recommendations: localRecs
      });
    }

    try {
      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are an elite personal fitness coach and dietitian.
        Analyze this user's fitness profile:
        - Age: ${profile.age}
        - Height: ${profile.height} cm
        - Weight: ${profile.weight} kg
        - Goal: ${profile.fitnessGoal} (options: muscle_gain, fat_loss, maintenance, endurance)
        - Activity Level: ${profile.activityLevel}

        Generate a personalized workout program, daily diet guidelines, tips, and a motivational quote.
        You MUST respond ONLY with a valid JSON object matching this schema:
        {
          "workoutProgram": [
            { "day": "Monday", "focus": "Muscle Group Focus", "exercises": ["Exercise 1 (sets x reps)", "Exercise 2"] }
          ],
          "dietPlan": {
            "calories": 2500,
            "protein": 140,
            "carbs": 280,
            "fat": 80,
            "guideline": "Short summary explanation of the diet structure"
          },
          "tips": [
            "Tip 1 about execution or training",
            "Tip 2 about nutrition",
            "Tip 3 about recovery"
          ],
          "motivationalQuote": "A short inspiring quote"
        }
        Do not include markdown tags, code blocks (like \`\`\`json), or trailing commas. Output raw clean JSON only.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text()?.trim() || '';
      // Strip out markdown wrap if Gemini included it
      const cleanJson = responseText
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();

      const recommendations = JSON.parse(cleanJson);
      res.json({
        source: 'gemini_api',
        recommendations
      });
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to local recommendations:', apiError);
      const localRecs = generateLocalRecommendations(
        profile.fitnessGoal,
        profile.weight,
        profile.height,
        profile.age
      );
      res.json({
        source: 'local_heuristics_fallback',
        recommendations: localRecs
      });
    }
  } catch (error) {
    console.error('AI Recommendations Route Error:', error);
    res.status(500).json({ error: 'Server error generating recommendations.' });
  }
};
