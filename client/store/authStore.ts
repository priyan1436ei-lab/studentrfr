import { create } from 'zustand';
import { UserProfile, DashboardStats } from '../types/shared';


interface AuthState {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  profile: UserProfile | null;
  stats: DashboardStats | null;
  isAuthenticated: boolean;
  login: (token: string, user: any, profile: UserProfile) => void;
  logout: () => void;
  updateProfileState: (profile: UserProfile) => void;
  updateStatsState: (stats: DashboardStats) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  profile: null,
  stats: null,
  isAuthenticated: false,

  login: (token, user, profile) => {
    localStorage.setItem('fitverse_token', token);
    localStorage.setItem('fitverse_user', JSON.stringify(user));
    localStorage.setItem('fitverse_profile', JSON.stringify(profile));
    set({ token, user, profile, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('fitverse_token');
    localStorage.removeItem('fitverse_user');
    localStorage.removeItem('fitverse_profile');
    set({ token: null, user: null, profile: null, stats: null, isAuthenticated: false });
  },

  updateProfileState: (profile) => {
    localStorage.setItem('fitverse_profile', JSON.stringify(profile));
    set({ profile });
  },

  updateStatsState: (stats) => {
    set({ stats });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('fitverse_token');
    const userJson = localStorage.getItem('fitverse_user');
    const profileJson = localStorage.getItem('fitverse_profile');

    if (token && userJson && profileJson) {
      set({
        token,
        user: JSON.parse(userJson),
        profile: JSON.parse(profileJson),
        isAuthenticated: true
      });
    }
  }
}));
