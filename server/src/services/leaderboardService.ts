import { db } from '../db/database.js';
import { LeaderboardEntry } from '../types.js';

export class LeaderboardService {
  static getLeaderboard(wagerId: string): {
    wagerTitle: string;
    currency: string;
    stakeAmount: number;
    totalPot: number;
    targetDeadline: string;
    daysRemaining: number;
    entries: LeaderboardEntry[];
  } {
    const wager = db.getWagerById(wagerId);
    if (!wager) {
      throw new Error('Wager not found');
    }

    const participants = db.getWagerParticipants(wagerId);
    const today = new Date().toISOString().slice(0, 10);
    const deadlineDate = new Date(wager.targetDeadline);
    const currentDate = new Date(today);
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.max(0.14, daysRemaining / 7); // minimum 1 day represented as fraction

    const entries: LeaderboardEntry[] = participants
      .filter((p) => p.status === 'active')
      .map((p) => {
        const user = db.getUserById(p.userId);
        const streak = db.getUserStreak(p.userId);

        const isGain = p.goalType === 'gain';
        const start = p.startingWeight;
        const current = p.currentWeight;
        const target = p.targetWeight;

        let lostSoFar = 0;
        let totalNeeded = 0;
        let remaining = 0;

        if (isGain) {
          lostSoFar = Math.round((current - start) * 10) / 10;
          totalNeeded = Math.max(0.1, target - start);
          remaining = Math.max(0, Math.round((target - current) * 10) / 10);
        } else {
          lostSoFar = Math.round((start - current) * 10) / 10;
          totalNeeded = Math.max(0.1, start - target);
          remaining = Math.max(0, Math.round((current - target) * 10) / 10);
        }

        const rawProgress = (lostSoFar / totalNeeded) * 100;
        const progressPercent = Math.min(100, Math.max(0, Math.round(rawProgress * 10) / 10));
        const requiredPaceKgPerWeek = Math.round((remaining / weeksRemaining) * 100) / 100;
        const isDangerZone =
          requiredPaceKgPerWeek > 1.2 || (progressPercent < 15 && daysRemaining < 30);

        return {
          userId: p.userId,
          participantId: p.id,
          wagerId: p.wagerId,
          name: user?.fullName || 'Participant',
          avatarInitials: user?.avatarInitials || 'P',
          avatarColor: user?.avatarColor || 'emerald',
          avatarUrl: user?.avatarUrl,
          role: p.role,
          goalType: p.goalType,
          startingWeight: start,
          currentWeight: current,
          targetWeight: target,
          weightUnit: p.weightUnit,
          progressPercent,
          lostSoFar,
          remaining,
          daysRemaining,
          requiredPaceKgPerWeek,
          isDangerZone,
          currentStreak: streak.currentStreak,
          streakShields: streak.shieldsAvailable,
          rank: 1, // Will be set after sorting
          joinedAt: p.joinedAt,
        };
      });

    // Sort descending by progress percentage
    entries.sort((a, b) => {
      if (b.progressPercent !== a.progressPercent) {
        return b.progressPercent - a.progressPercent;
      }
      return a.joinedAt.localeCompare(b.joinedAt);
    });

    // Assign rank
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return {
      wagerTitle: wager.title,
      currency: wager.currency,
      stakeAmount: wager.stakeAmount,
      totalPot: wager.totalPot,
      targetDeadline: wager.targetDeadline,
      daysRemaining,
      entries,
    };
  }
}
