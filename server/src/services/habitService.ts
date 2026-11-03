import crypto from 'crypto';
import { db } from '../db/database.js';
import { DailyHabitRecord, UserStreak } from '../types.js';

export class HabitService {
  static async getTodayHabits(userId: string, dateStr?: string): Promise<DailyHabitRecord[]> {
    const date = dateStr || new Date().toISOString().slice(0, 10);
    return await db.getUserHabitsForDate(userId, date);
  }

  static async toggleHabit(
    userId: string,
    discipline: string,
    completed: boolean,
    dateStr?: string,
    notes?: string
  ): Promise<{ habit: DailyHabitRecord; streak: UserStreak; dayCompleted: boolean }> {
    const today = dateStr || new Date().toISOString().slice(0, 10);
    const existing = await db.getHabit(userId, today, discipline);

    const habit: DailyHabitRecord = {
      id: existing?.id || crypto.randomUUID(),
      userId,
      habitDate: today,
      discipline,
      completed,
      notes: notes || existing?.notes,
      completedAt: completed ? new Date().toISOString() : undefined,
    };

    await db.saveHabit(habit);

    // Check if ALL chosen disciplines for user are completed today
    const userWagers = await db.getUserWagers(userId);
    let chosenDisciplines: string[] = ['gym', 'walking', 'diet'];
    if (userWagers.length > 0) {
      const p = await db.getParticipant(userWagers[0].id, userId);
      if (p && p.chosenDisciplines.length > 0) {
        chosenDisciplines = p.chosenDisciplines;
      }
    }

    const todayHabits = await db.getUserHabitsForDate(userId, today);
    const completedDisciplines = new Set(
      todayHabits.filter((h) => h.completed).map((h) => h.discipline)
    );

    const allCompleted = chosenDisciplines.every((d) => completedDisciplines.has(d));

    // Update streak logic
    let streak = await db.getUserStreak(userId);
    if (allCompleted) {
      if (streak.lastCompletedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (streak.lastCompletedDate === yesterday || streak.currentStreak === 0) {
          streak.currentStreak += 1;
        } else {
          streak.currentStreak += 1;
        }
        if (streak.currentStreak > streak.longestStreak) {
          streak.longestStreak = streak.currentStreak;
        }
        streak.lastCompletedDate = today;
        streak.updatedAt = new Date().toISOString();
        await db.saveUserStreak(streak);
      }
    } else {
      if (streak.lastCompletedDate === today) {
        streak.currentStreak = Math.max(0, streak.currentStreak - 1);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak.lastCompletedDate = streak.currentStreak > 0 ? yesterday : undefined;
        streak.updatedAt = new Date().toISOString();
        await db.saveUserStreak(streak);
      }
    }

    return { habit, streak, dayCompleted: allCompleted };
  }

  static async getStreakStats(userId: string): Promise<UserStreak> {
    return await db.getUserStreak(userId);
  }

  static async useShield(userId: string): Promise<UserStreak> {
    const streak = await db.getUserStreak(userId);
    if (streak.shieldsAvailable > 0) {
      streak.shieldsAvailable -= 1;
      streak.updatedAt = new Date().toISOString();
      await db.saveUserStreak(streak);
    }
    return streak;
  }
}
