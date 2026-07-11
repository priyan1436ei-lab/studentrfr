'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  Trophy, 
  Users, 
  Send, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Share2,
  TrendingUp,
  Award
} from 'lucide-react';

export default function SocialView() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [postContent, setPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Query leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<any[]>({
    queryKey: ['leaderboard'],
    queryFn: api.social.getLeaderboard
  });

  // Query feed
  const { data: feed = [], isLoading: feedLoading } = useQuery<any[]>({
    queryKey: ['feed'],
    queryFn: api.social.getFeed
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (content: string) => api.social.createPost(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setPostContent('');
    }
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.social.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      api.social.comment(postId, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setCommentInputs(prev => ({ ...prev, [data.postId]: '' }));
    }
  });

  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => api.social.follow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  // Handle submissions
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    createPostMutation.mutate(postContent);
  };

  const handleLikePost = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const content = commentInputs[postId] || '';
    if (!content.trim()) return;
    commentMutation.mutate({ postId, content });
  };

  const handleCommentChange = (postId: string, val: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: val }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Col 1: Social Feed (Left) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Post Creator Card */}
        <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-2xl backdrop-blur">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <textarea
                placeholder="Share your workout progress or log a daily streak milestone..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
                rows={3}
                className="flex-1 w-full p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-500 font-bold">Post will earn +15 XP</span>
              <button
                type="submit"
                disabled={createPostMutation.isPending || !postContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Share Post
              </button>
            </div>
          </form>
        </div>

        {/* Feed List */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
          {feedLoading ? (
            <div className="text-center py-8 text-slate-500">Loading feed...</div>
          ) : feed.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-900/10 border border-slate-800/40 rounded-2xl">
              No feed posts yet. Write your first check-in above!
            </div>
          ) : (
            feed.map((post) => (
              <div key={post.id} className="bg-[#131b2e]/20 border border-slate-850 p-5 rounded-2xl space-y-4 shadow-md">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm">
                      {post.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{post.userName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Actions bar */}
                <div className="flex items-center gap-4 pt-2 border-t border-b border-slate-800/80 py-2">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1 text-xs font-bold transition ${
                      post.likedByCurrentUser ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>

                {/* Comments checklist */}
                {post.comments.length > 0 && (
                  <div className="space-y-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-850/80 max-h-[150px] overflow-y-auto">
                    {post.comments.map((comm: any) => (
                      <div key={comm.id} className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-200">{comm.userName}: </span>
                        <span className="text-slate-400 leading-relaxed">{comm.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment form */}
                <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 text-indigo-400 hover:text-indigo-300 font-extrabold"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Col 2: Leaderboard (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#131b2e]/30 border border-slate-850 p-5 rounded-2xl shadow-xl backdrop-blur flex flex-col h-full min-h-[400px]">
          <h3 className="text-sm font-extrabold text-white border-b border-slate-800/80 pb-3 mb-4 flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> FitVerse Leaderboard
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {leaderboardLoading ? (
              <div className="text-center py-8 text-slate-500">Loading ranks...</div>
            ) : (
              leaderboard.map((player, idx) => {
                const isSelf = player.userId === user?.id;
                const rankColors = [
                  'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', // 1st
                  'text-slate-300 bg-slate-300/10 border-slate-300/20',   // 2nd
                  'text-amber-600 bg-amber-600/10 border-amber-600/20'    // 3rd
                ];

                return (
                  <div 
                    key={player.userId}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isSelf 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'bg-slate-950/20 border-slate-850/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span className={`h-6 w-6 rounded-full border text-[10px] font-extrabold flex items-center justify-center ${
                        idx < 3 ? rankColors[idx] : 'text-slate-500 border-slate-800 bg-slate-900/40'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div>
                        <h4 className={`text-xs font-bold ${isSelf ? 'text-indigo-400' : 'text-white'}`}>
                          {player.name} {isSelf && '(You)'}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Level {player.level} • {player.xp} XP
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.streak > 0 && (
                        <span className="text-[10px] font-bold text-pink-400 bg-pink-500/5 border border-pink-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                          🔥 {player.streak}d
                        </span>
                      )}
                      
                      {!isSelf && (
                        <button
                          onClick={() => followMutation.mutate(player.userId)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/5 border border-transparent hover:border-indigo-500/20 transition"
                          title="Follow Athlete"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
