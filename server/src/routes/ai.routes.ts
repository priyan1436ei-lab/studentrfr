import { Router } from 'express';
import { getAIRecommendations } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/recommendations', authenticateToken, getAIRecommendations);

export default router;
