import { z } from 'zod';

export type GoalType = 'loss' | 'gain';
export type WagerStatus = 'draft' | 'active' | 'verification' | 'completed' | 'cancelled';
export type ParticipantRole = 'owner' | 'participant' | 'spectator';
export type ParticipantStatus = 'active' | 'forfeited' | 'disqualified' | 'winner';
export type BanterType = 'nudge' | 'cheer' | 'taunt' | 'danger' | 'milestone' | 'system';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  fullName: string;
  avatarInitials: string;
  avatarColor: string;
  avatarUrl?: string;
  timezone: string;
  privacyMode: 'full_numbers' | 'delta_only' | 'percentage_only';
  createdAt: string;
  updatedAt: string;
}

export interface Wager {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  currency: string; // 'INR' or '₹'
  stakeAmount: number;
  totalPot: number;
  status: WagerStatus;
  startDate: string; // YYYY-MM-DD
  targetDeadline: string; // YYYY-MM-DD
  forfeitRule: string;
  inviteCode: string;
  inviteExpiresAt?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WagerParticipant {
  id: string;
  wagerId: string;
  userId: string;
  role: ParticipantRole;
  goalType: GoalType;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  chosenDisciplines: string[];
  status: ParticipantStatus;
  joinedAt: string;
}

export interface WeighInRecord {
  id: string;
  userId: string;
  wagerId: string;
  weight: number;
  unit: 'kg' | 'lbs';
  weighInDate: string; // YYYY-MM-DD
  photoUrl?: string;
  isVerified: boolean;
  notes?: string;
  createdAt: string;
}

export interface DailyHabitRecord {
  id: string;
  userId: string;
  habitDate: string; // YYYY-MM-DD
  discipline: string;
  completed: boolean;
  durationMinutes?: number;
  notes?: string;
  completedAt?: string;
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  shieldsAvailable: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  updatedAt: string;
}

export interface BanterItem {
  id: string;
  wagerId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  recipientId?: string;
  recipientName?: string;
  type: BanterType;
  message: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  participantId: string;
  wagerId: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  avatarUrl?: string;
  role: ParticipantRole;
  goalType: GoalType;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  progressPercent: number;
  lostSoFar: number; // Positive means progress towards goal
  remaining: number;
  daysRemaining: number;
  requiredPaceKgPerWeek: number;
  isDangerZone: boolean;
  currentStreak: number;
  streakShields: number;
  rank: number;
  joinedAt: string;
}

// Zod Validation Schemas
export const SendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid phone number required').max(15),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  fullName: z.string().min(2).optional(),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarInitials: z.string().min(1).max(4).optional(),
  avatarColor: z.string().optional(),
  timezone: z.string().optional(),
  privacyMode: z.enum(['full_numbers', 'delta_only', 'percentage_only']).optional(),
});

export const CreateWagerSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  currency: z.string().default('₹'),
  stakeAmount: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  targetDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  forfeitRule: z.string().min(5),
  // Initial baseline for creator
  goalType: z.enum(['loss', 'gain']),
  startingWeight: z.number().positive(),
  targetWeight: z.number().positive(),
  chosenDisciplines: z.array(z.string()).default(['gym', 'walking', 'diet']),
});

export const JoinWagerSchema = z.object({
  goalType: z.enum(['loss', 'gain']),
  startingWeight: z.number().positive(),
  targetWeight: z.number().positive(),
  chosenDisciplines: z.array(z.string()).default(['gym', 'walking', 'diet']),
});

export const LogWeighInSchema = z.object({
  wagerId: z.string().uuid().or(z.string().min(1)),
  weight: z.number().positive(),
  weighInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(300).optional(),
  photoUrl: z.string().url().optional(),
});

export const ToggleHabitSchema = z.object({
  discipline: z.string().min(1),
  habitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

export const CreateBanterSchema = z.object({
  recipientId: z.string().optional(),
  type: z.enum(['nudge', 'cheer', 'taunt', 'danger', 'milestone', 'system']),
  message: z.string().min(1).max(280),
});
