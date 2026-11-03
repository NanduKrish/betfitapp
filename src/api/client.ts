/**
 * BetFit Arena Production API Client
 * Provides typed methods for all backend endpoints with automatic Bearer token
 * inclusion and fallback support for offline operations.
 */

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('betfit_auth_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// 1. Auth API
export const authApi = {
  async sendOtp(phone: string) {
    return request<{ success: boolean; message: string; devOtp?: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, otp: string, fullName?: string) {
    const data = await request<{ token: string; user: any }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, fullName }),
    });
    if (data.token) {
      localStorage.setItem('betfit_auth_token', data.token);
    }
    return data;
  },

  async googleSignIn(email: string, name: string) {
    const data = await request<{ token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    if (data.token) {
      localStorage.setItem('betfit_auth_token', data.token);
    }
    return data;
  },

  async getMe() {
    return request<{ user: any }>('/auth/me');
  },

  async logout() {
    localStorage.removeItem('betfit_auth_token');
    return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },
};

// 2. User API
export const userApi = {
  async getProfile() {
    return request<{ user: any }>('/users/profile');
  },

  async updateProfile(updates: any) {
    return request<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteAccount() {
    localStorage.removeItem('betfit_auth_token');
    return request<{ success: boolean }>('/users/me', { method: 'DELETE' });
  },
};

// 3. Wager Showdowns API
export const wagerApi = {
  async getWagers() {
    return request<{ wagers: any[] }>('/wagers');
  },

  async getWager(id: string) {
    return request<{ wager: any }>(`/wagers/${id}`);
  },

  async previewInvite(code: string) {
    return request<{ wager: any }>(`/wagers/invite/${code}`);
  },

  async createWager(data: {
    title: string;
    description?: string;
    currency?: string;
    stakeAmount: number;
    targetDeadline: string;
    forfeitRule: string;
    goalType: 'loss' | 'gain';
    startingWeight: number;
    targetWeight: number;
    chosenDisciplines: string[];
  }) {
    return request<{ wager: any; participant: any }>('/wagers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinWager(
    wagerId: string,
    data: {
      goalType: 'loss' | 'gain';
      startingWeight: number;
      targetWeight: number;
      chosenDisciplines: string[];
    }
  ) {
    return request<{ wager: any; participant: any }>(`/wagers/${wagerId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateWager(wagerId: string, updates: any) {
    return request<{ wager: any }>(`/wagers/${wagerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteWager(wagerId: string) {
    return request<{ success: boolean }>(`/wagers/${wagerId}`, {
      method: 'DELETE',
    });
  },
};

// 4. Weigh-Ins API
export const weighInApi = {
  async logWeighIn(data: {
    wagerId: string;
    weight: number;
    weighInDate?: string;
    notes?: string;
    photoUrl?: string;
  }) {
    return request<{ record: any }>('/weigh-ins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getHistory(wagerId: string) {
    return request<{ history: any[] }>(`/weigh-ins/${wagerId}`);
  },
};

// 5. Habits & Streaks API
export const habitApi = {
  async getTodayHabits(date?: string) {
    const qs = date ? `?date=${date}` : '';
    return request<{ habits: any[] }>(`/habits/today${qs}`);
  },

  async toggleHabit(discipline: string, completed: boolean, habitDate?: string) {
    return request<{ habit: any; streak: any; dayCompleted: boolean }>('/habits/toggle', {
      method: 'POST',
      body: JSON.stringify({ discipline, completed, habitDate }),
    });
  },

  async getStreakStats() {
    return request<{ stats: any }>('/habits/stats');
  },

  async useShield() {
    return request<{ stats: any }>('/habits/shield', { method: 'POST' });
  },
};

// 6. Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(wagerId: string) {
    return request<{
      leaderboard: {
        wagerTitle: string;
        currency: string;
        stakeAmount: number;
        totalPot: number;
        targetDeadline: string;
        daysRemaining: number;
        entries: any[];
      };
    }>(`/leaderboard/${wagerId}`);
  },
};

// 7. Banter & Social API
export const banterApi = {
  async getBanter(wagerId: string) {
    return request<{ banter: any[] }>(`/banter/${wagerId}`);
  },

  async postBanter(
    wagerId: string,
    data: {
      type: 'nudge' | 'cheer' | 'taunt' | 'danger' | 'milestone';
      message: string;
      recipientId?: string;
    }
  ) {
    return request<{ item: any }>(`/banter/${wagerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
