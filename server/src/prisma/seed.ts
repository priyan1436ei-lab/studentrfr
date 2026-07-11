import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean DB
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follows.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Mock Users
  const user1 = await prisma.user.create({
    data: {
      email: 'alex@fitverse.ai',
      name: 'Coach Alex',
      passwordHash,
      profile: {
        create: {
          gender: 'male',
          age: 28,
          height: 182,
          weight: 85,
          fitnessGoal: 'muscle_gain',
          activityLevel: 'active',
          calorieTarget: 3200,
          waterTarget: 3500,
          sleepTarget: 8.5,
          xp: 4500, // Level 5
          level: 5,
          streak: 12,
          avatarType: 'muscular'
        }
      }
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'sara@fitverse.ai',
      name: 'Yoga Sara',
      passwordHash,
      profile: {
        create: {
          gender: 'female',
          age: 24,
          height: 165,
          weight: 54,
          fitnessGoal: 'endurance',
          activityLevel: 'moderate',
          calorieTarget: 1900,
          waterTarget: 2500,
          sleepTarget: 8.0,
          xp: 2800, // Level 3
          level: 3,
          streak: 5,
          avatarType: 'fit'
        }
      }
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'mike@fitverse.ai',
      name: 'Iron Mike',
      passwordHash,
      profile: {
        create: {
          gender: 'male',
          age: 32,
          height: 175,
          weight: 92,
          fitnessGoal: 'muscle_gain',
          activityLevel: 'active',
          calorieTarget: 3500,
          waterTarget: 4000,
          sleepTarget: 7.5,
          xp: 850, // Level 1
          level: 1,
          streak: 3,
          avatarType: 'muscular'
        }
      }
    }
  });

  console.log('✅ Created mock users & profiles.');

  // Create follow connections
  await prisma.follows.createMany({
    data: [
      { followerId: user1.id, followingId: user2.id },
      { followerId: user2.id, followingId: user1.id },
      { followerId: user3.id, followingId: user1.id }
    ]
  });

  // Sample Workout Plans for Coach Alex
  const alexExercises = [
    { name: 'Barbell Bench Press', category: 'chest', sets: 4, reps: 8, duration: 120 },
    { name: 'Incline Dumbbell Press', category: 'chest', sets: 3, reps: 10, duration: 90 },
    { name: 'Weighted Pull-ups', category: 'back', sets: 3, reps: 8, duration: 120 },
    { name: 'Overhead Shoulder Press', category: 'shoulders', sets: 3, reps: 10, duration: 90 }
  ];

  await prisma.workoutPlan.create({
    data: {
      userId: user1.id,
      name: 'Alex Hypertrophy Push',
      description: 'Advanced push routine focused on mechanical tension and strength gains.',
      exercises: JSON.stringify(alexExercises)
    }
  });

  // Sample Workout Plans for Yoga Sara
  const saraExercises = [
    { name: 'Sun Salutation Flow', category: 'fullbody', sets: 3, reps: 5, duration: 300 },
    { name: 'Warrior Pose Hold', category: 'legs', sets: 3, reps: 1, duration: 60 },
    { name: 'Down dog to plank transitions', category: 'core', sets: 4, reps: 10, duration: 90 }
  ];

  await prisma.workoutPlan.create({
    data: {
      userId: user2.id,
      name: 'Vinyasa Flow Routine',
      description: 'A moderate flow focused on full-body mobility and deep breathing.',
      exercises: JSON.stringify(saraExercises)
    }
  });

  // Sample Posts in Feed
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'Just smashed a new Personal Record on Bench Press! 120kg for 6 reps. Progress is compounding! 💪🔥 #strength #gains',
      createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
    }
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'Hydration is key. Logged 3L today and completed a 45-minute active recovery session. Take care of your joints! 🧘‍♀️💧',
      createdAt: new Date(Date.now() - 3600000 * 5) // 5 hours ago
    }
  });

  // Add comments & likes
  await prisma.like.create({
    data: { postId: post1.id, userId: user2.id }
  });
  await prisma.like.create({
    data: { postId: post1.id, userId: user3.id }
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user2.id,
      content: 'Incredible lift Alex! Solid form.'
    }
  });

  console.log('✅ Created mock plans and social feed entries.');
  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
