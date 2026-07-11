import { useAuthStore } from '../store/authStore';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data;
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (name: string, email: string, password: string) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  profile: {
    get: async () => {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    update: async (data: any) => {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  workouts: {
    getPlans: async () => {
      const res = await fetch(`${BASE_URL}/workouts/plans`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    createPlan: async (data: any) => {
      const res = await fetch(`${BASE_URL}/workouts/plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getLogs: async () => {
      const res = await fetch(`${BASE_URL}/workouts/logs`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    log: async (data: any) => {
      const res = await fetch(`${BASE_URL}/workouts/logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    }
  },

  tracker: {
    getFood: async () => {
      const res = await fetch(`${BASE_URL}/tracker/food`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    logFood: async (data: any) => {
      const res = await fetch(`${BASE_URL}/tracker/food`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getWater: async () => {
      const res = await fetch(`${BASE_URL}/tracker/water`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    logWater: async (amount: number) => {
      const res = await fetch(`${BASE_URL}/tracker/water`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount })
      });
      return handleResponse(res);
    },
    getSleep: async () => {
      const res = await fetch(`${BASE_URL}/tracker/sleep`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    logSleep: async (data: any) => {
      const res = await fetch(`${BASE_URL}/tracker/sleep`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getSteps: async () => {
      const res = await fetch(`${BASE_URL}/tracker/steps`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    logSteps: async (steps: number) => {
      const res = await fetch(`${BASE_URL}/tracker/steps`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ steps })
      });
      return handleResponse(res);
    },
    getStats: async () => {
      const res = await fetch(`${BASE_URL}/tracker/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  social: {
    getLeaderboard: async () => {
      const res = await fetch(`${BASE_URL}/social/leaderboard`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getFeed: async () => {
      const res = await fetch(`${BASE_URL}/social/feed`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    createPost: async (content: string, imageUrl?: string) => {
      const res = await fetch(`${BASE_URL}/social/feed`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content, imageUrl })
      });
      return handleResponse(res);
    },
    likePost: async (postId: string) => {
      const res = await fetch(`${BASE_URL}/social/feed/like`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ postId })
      });
      return handleResponse(res);
    },
    comment: async (postId: string, content: string) => {
      const res = await fetch(`${BASE_URL}/social/feed/comment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ postId, content })
      });
      return handleResponse(res);
    },
    follow: async (targetUserId: string) => {
      const res = await fetch(`${BASE_URL}/social/follow`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId })
      });
      return handleResponse(res);
    }
  },

  ai: {
    getRecommendations: async () => {
      const res = await fetch(`${BASE_URL}/ai/recommendations`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
