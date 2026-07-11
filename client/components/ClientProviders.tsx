'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { 
  Dumbbell, 
  Droplet, 
  Moon, 
  Flame, 
  Compass, 
  Trophy, 
  User, 
  MessageSquare, 
  LogOut, 
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ProvidersProps) {
  const { hydrate, isAuthenticated, login, logout, user, profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    hydrate();
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isRegister) {
        if (!name) throw new Error('Name is required');
        const res = await api.auth.register(name, email, password);
        login(res.token, res.user, res.user.profile);
      } else {
        const res = await api.auth.login(email, password);
        login(res.token, res.user, res.user.profile);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-sky-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] relative overflow-hidden font-sans p-4">
          {/* Animated decorative glow rings */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none"></div>

          <div className="w-full max-w-md bg-[#131b2e]/60 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-3 animate-pulse">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
                FitVerse AI
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                {isRegister ? 'Begin your 3D health transformation journey' : 'Sign in to access your virtual 3D gym & trainer'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold text-center">
                  ⚠️ {authError}
                </div>
              )}

              {isRegister && (
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a]/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a]/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a]/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-lg transition shadow-lg shadow-sky-500/25 hover:shadow-sky-400/35 transform active:scale-[0.98] text-sm flex justify-center items-center gap-2"
              >
                {authLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : isRegister ? (
                  <>
                    <UserCheck className="h-4 w-4" /> Start Training
                  </>
                ) : (
                  <>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthError('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                {isRegister ? 'Already have an account? Sign In' : "New to FitVerse? Create Account"}
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
              Demo account: <span className="text-sky-500/80">alex@fitverse.ai</span> / password: <span className="text-sky-500/80">password123</span>
            </div>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
