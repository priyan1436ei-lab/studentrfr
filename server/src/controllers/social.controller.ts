import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth.middleware';

// LEADERBOARD
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            level: true,
            xp: true,
            streak: true
          }
        }
      },
      orderBy: [
        { profile: { level: 'desc' } },
        { profile: { xp: 'desc' } }
      ],
      take: 10
    });

    const formatted = leaderboard.map(u => ({
      userId: u.id,
      name: u.name,
      level: u.profile?.level ?? 1,
      xp: u.profile?.xp ?? 0,
      streak: u.profile?.streak ?? 0
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({ error: 'Server error loading leaderboard.' });
  }
};

// FOLLOW SYSTEM
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { targetUserId } = req.body;

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const checkUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!checkUser) return res.status(404).json({ error: 'Target user not found.' });

    await prisma.follows.upsert({
      where: {
        followerId_followingId: {
          followerId: userId!,
          followingId: targetUserId
        }
      },
      create: {
        followerId: userId!,
        followingId: targetUserId
      },
      update: {}
    });

    res.json({ message: `Successfully followed ${checkUser.name}!` });
  } catch (error) {
    console.error('Follow User Error:', error);
    res.status(500).json({ error: 'Server error following user.' });
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { targetUserId } = req.body;

    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId!,
          followingId: targetUserId
        }
      }
    });

    res.json({ message: 'Successfully unfollowed user.' });
  } catch (error) {
    console.error('Unfollow User Error:', error);
    res.status(500).json({ error: 'Server error unfollowing user.' });
  }
};

// SOCIAL FEED / POSTS
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { content, imageUrl } = req.body;

    if (!content) return res.status(400).json({ error: 'Post content cannot be empty.' });

    const post = await prisma.post.create({
      data: {
        userId: userId!,
        content,
        imageUrl
      },
      include: {
        user: { select: { name: true } }
      }
    });

    // Add post XP
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      const newXp = profile.xp + 15;
      await prisma.profile.update({
        where: { userId },
        data: {
          xp: newXp,
          level: Math.floor(newXp / 1000) + 1
        }
      });
    }

    res.status(201).json({
      ...post,
      userName: post.user.name,
      likesCount: 0,
      likedByCurrentUser: false,
      comments: []
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Server error creating post.' });
  }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Fetch followed users
    const following = await prisma.follows.findMany({
      where: { followerId: userId! },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // Feed includes followed users + self
    const feedUserIds = [...followingIds, userId!];

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: feedUserIds }
      },
      include: {
        user: { select: { name: true } },
        likes: true,
        comments: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(p => {
      const likedByCurrentUser = p.likes.some(l => l.userId === userId);
      return {
        id: p.id,
        userId: p.userId,
        userName: p.user.name,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
        likesCount: p.likes.length,
        likedByCurrentUser,
        comments: p.comments.map(c => ({
          id: c.id,
          postId: c.postId,
          userId: c.userId,
          userName: c.user.name,
          content: c.content,
          createdAt: c.createdAt.toISOString()
        }))
      };
    });

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ error: 'Server error fetching feed.' });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.body;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId: userId! }
      }
    });

    if (existingLike) {
      // Unliking
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return res.json({ message: 'Post unliked.', liked: false });
    } else {
      // Liking
      await prisma.like.create({
        data: { postId, userId: userId! }
      });
      return res.json({ message: 'Post liked.', liked: true });
    }
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ error: 'Server error toggling post like.' });
  }
};

export const commentOnPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { postId, content } = req.body;

    if (!content) return res.status(400).json({ error: 'Comment cannot be empty.' });

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: userId!,
        content
      },
      include: {
        user: { select: { name: true } }
      }
    });

    res.status(201).json({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      userName: comment.user.name,
      content: comment.content,
      createdAt: comment.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Comment Error:', error);
    res.status(500).json({ error: 'Server error commenting on post.' });
  }
};
