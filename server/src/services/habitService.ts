import crypto from 'crypto';
import { db } from '../db/database.js';
import { DailyHabitRecord, UserStreak } from '../types.js';

export class HabitService {
  static getTodayHabits(userId: string, dateStr?: string): DailyHabitRecord[] {
    const date = dateStr || new Date().toISOString().slice(0, 10);
    return db.getUserHabitsForDate(userId, date);
  }

  static toggleHabit(
    userId: string,
    discipline: string,
    completed: boolean,
    dateStr?: string,
    notes?: string
  ): { habit: DailyHabitRecord; streak: UserStreak; dayCompleted: boolean } {
    const today = dateStr || new Date().toISOString().slice(0, 10);
    const existing = db.getHabit(userId, today, discipline);

    const habit: DailyHabitRecord = {
      id: existing?.id || crypto.randomUUID(),
      userId,
      habitDate: today,
      discipline,
      completed,
      notes: notes || existing?.notes,
      completedAt: completed ? new Date().toISOString() : undefined,
    };

    db.saveHabit(habit);

    // Check if ALL chosen disciplines for user are completed today
    // We can query user's active wager participant to find chosenDisciplines
    const userWagers = db.getUserWagers(userId);
    let chosenDisciplines: string[] = ['gym', 'walking', 'diet'];
    if (userWagers.length > 0) {
      const p = db.getParticipant(userWagers[0].id, userId);
      if (p && p.chosenDisciplines.length > 0) {
        chosenDisciplines = p.chosenDisciplines;
      }
    }

    const todayHabits = db.getUserHabitsForDate(userId, today);
    const completedDisciplines = new Set(
      todayHabits.filter((h) => h.completed).map((h) => h.discipline)
    );

    const allCompleted = chosenDisciplines.every((d) => completedDisciplines.has(d));

    // Update streak logic
    let streak = db.getUserStreak(userId);
    if (allCompleted) {
      // If today wasn't already marked completed, increment streak!
      if (streak.lastCompletedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (streak.lastCompletedDate === yesterday || streak.currentStreak === 0) {
          streak.currentStreak += 1;
        } else {
          // Missed days, but if shields available
          streak.currentStreak += 1;
        }
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
        streak.lastCompletedDate = today;
        streak.updatedAt = new Date().toISOString();
        db.saveUserStreak(streak);
      }
    } else {
      // If user unchecks a habit on today, and today was previously marked completed, revert today's completion
      if (streak.lastCompletedDate === today) {
        streak.currentStreak = Math.max(0, streak.currentStreak - 1);
        // Reset lastCompletedDate to yesterday if streak > 0
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak.lastCompletedDate = streak.currentStreak > 0 ? yesterday : undefined;
        streak.updatedAt = new Date().toISOString();
        db.saveUserStreak(streak);
      }
    }

    return { habit, streak, dayCompleted: allCompleted };
  }

  static getStreakStats(userId: string): UserStreak {
    return db.getUserStreak(userId);
  }

  static useShield(userId: string): UserStreak {
    const streak = db.getUserStreak(userId);
    if (streak.shieldsAvailable > 0) {
      streak.shieldsAvailable -= 1;
      streak.updatedAt = new Date().toISOString();
      db.saveUserStreak(streak);
    }
    return streak;
  }
}
