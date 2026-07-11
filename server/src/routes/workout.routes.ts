import { Router } from 'express';
import { getWorkoutPlans, createWorkoutPlan, getWorkoutLogs, logWorkout } from '../controllers/workout.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', authenticateToken, getWorkoutPlans);
router.post('/plans', authenticateToken, createWorkoutPlan);
router.get('/logs', authenticateToken, getWorkoutLogs);
router.post('/logs', authenticateToken, logWorkout);

export default router;
