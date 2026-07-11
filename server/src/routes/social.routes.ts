import { Router } from 'express';
import {
  getLeaderboard,
  followUser,
  unfollowUser,
  createPost,
  getFeed,
  likePost,
  commentOnPost
} from '../controllers/social.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', authenticateToken, getLeaderboard);
router.post('/follow', authenticateToken, followUser);
router.post('/unfollow', authenticateToken, unfollowUser);
router.get('/feed', authenticateToken, getFeed);
router.post('/feed', authenticateToken, createPost);
router.post('/feed/like', authenticateToken, likePost);
router.post('/feed/comment', authenticateToken, commentOnPost);

export default router;
