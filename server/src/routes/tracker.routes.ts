import { Router } from 'express';
import {
  getFoodLogs,
  logFood,
  getWaterLogs,
  logWater,
  getSleepLogs,
  logSleep,
  getStepLogs,
  logSteps,
  getDashboardStats
} from '../controllers/tracker.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/food', authenticateToken, getFoodLogs);
router.post('/food', authenticateToken, logFood);

router.get('/water', authenticateToken, getWaterLogs);
router.post('/water', authenticateToken, logWater);

router.get('/sleep', authenticateToken, getSleepLogs);
router.post('/sleep', authenticateToken, logSleep);

router.get('/steps', authenticateToken, getStepLogs);
router.post('/steps', authenticateToken, logSteps);

router.get('/stats', authenticateToken, getDashboardStats);

export default router;
