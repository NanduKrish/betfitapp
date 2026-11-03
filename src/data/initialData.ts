import { BetGroup, UserProfile, WeighIn, ActivityLog, BanterItem } from '../types';

export const INITIAL_BET_GROUP: BetGroup = {
  id: 'december-bet-2026',
  title: 'December Fitness Showdown',
  targetDeadline: '2026-12-31',
  wagerDescription: '₹1,000 stake per person by Dec 31',
  potAmount: 1000,
  currency: '₹',
  forfeitDescription: 'Loser treats the winner to dinner',
  creatorName: ''
};

// Start completely fresh with zero dummy users
export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_WEIGH_INS: Record<string, WeighIn[]> = {};

export const INITIAL_TODAY_ACTIVITIES: ActivityLog[] = [];

export const INITIAL_BANTER: BanterItem[] = [];
