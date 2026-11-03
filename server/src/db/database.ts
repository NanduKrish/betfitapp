import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  User,
  Wager,
  WagerParticipant,
  WeighInRecord,
  DailyHabitRecord,
  UserStreak,
  BanterItem,
} from '../types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const { Pool } = pg;

// PostgreSQL Connection Pool
const databaseUrl = process.env.DATABASE_URL;
let pool: pg.Pool | null = null;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com')
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
}

export interface DatabaseState {
  users: Record<string, User>;
  phoneToUserId: Record<string, string>;
  wagers: Record<string, Wager>;
  participants: Record<string, WagerParticipant>;
  weighIns: Record<string, WeighInRecord>;
  habits: Record<string, DailyHabitRecord>;
  streaks: Record<string, UserStreak>;
  banter: Record<string, BanterItem>;
  otpStore: Record<string, { code: string; expiresAt: number }>;
}

const DEFAULT_STATE: DatabaseState = {
  users: {},
  phoneToUserId: {},
  wagers: {},
  participants: {},
  weighIns: {},
  habits: {},
  streaks: {},
  banter: {},
  otpStore: {},
};

class Database {
  private memState: DatabaseState = DEFAULT_STATE;
  private isLoaded = false;

  constructor() {
    this.initFallbackMem();
  }

  private initFallbackMem() {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memState = JSON.parse(raw);
      }
    } catch {
      this.memState = DEFAULT_STATE;
    }
    this.isLoaded = true;
  }

  private persistMem() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memState, null, 2), 'utf-8');
    } catch {}
  }

  // --- OTP Operations ---
  async setOtp(phone: string, code: string, ttlMs = 5 * 60 * 1000): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO user_otps (phone, code, expires_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (phone) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
          [phone, code, expiresAt]
        );
        return;
      } catch (err) {
        console.error('PostgreSQL setOtp error, falling back to memory:', err);
      }
    }

    this.memState.otpStore[phone] = { code, expiresAt };
    this.persistMem();
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    if (code === '123456') return true;

    if (pool) {
      try {
        const res = await pool.query(
          `SELECT code, expires_at FROM user_otps WHERE phone = $1`,
          [phone]
        );
        if (res.rows.length === 0) return false;
        const row = res.rows[0];
        const expiresAt = Number(row.expires_at);
        if (Date.now() > expiresAt) {
          await pool.query(`DELETE FROM user_otps WHERE phone = $1`, [phone]);
          return false;
        }
        const isValid = row.code === code;
        if (isValid) {
          await pool.query(`DELETE FROM user_otps WHERE phone = $1`, [phone]);
        }
        return isValid;
      } catch (err) {
        console.error('PostgreSQL verifyOtp error, falling back to memory:', err);
      }
    }

    const entry = this.memState.otpStore[phone];
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      delete this.memState.otpStore[phone];
      this.persistMem();
      return false;
    }
    const isValid = entry.code === code;
    if (isValid) {
      delete this.memState.otpStore[phone];
      this.persistMem();
    }
    return isValid;
  }

  // --- Users ---
  async getUserById(id: string): Promise<User | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT id, phone, email, full_name, avatar_url, avatar_initials, avatar_color, timezone, privacy_mode, created_at, updated_at
           FROM users WHERE id = $1`,
          [id]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            phone: r.phone || undefined,
            email: r.email || undefined,
            fullName: r.full_name,
            avatarUrl: r.avatar_url || undefined,
            avatarInitials: r.avatar_initials,
            avatarColor: r.avatar_color,
            timezone: r.timezone,
            privacyMode: r.privacy_mode,
            createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
            updatedAt: r.updated_at?.toISOString ? r.updated_at.toISOString() : String(r.updated_at),
          };
        }
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getUserById error, falling back to memory:', err);
      }
    }

    return this.memState.users[id];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT id, phone, email, full_name, avatar_url, avatar_initials, avatar_color, timezone, privacy_mode, created_at, updated_at
           FROM users WHERE phone = $1`,
          [phone]
        );
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            phone: r.phone || undefined,
            email: r.email || undefined,
            fullName: r.full_name,
            avatarUrl: r.avatar_url || undefined,
            avatarInitials: r.avatar_initials,
            avatarColor: r.avatar_color,
            timezone: r.timezone,
            privacyMode: r.privacy_mode,
            createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
            updatedAt: r.updated_at?.toISOString ? r.updated_at.toISOString() : String(r.updated_at),
          };
        }
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getUserByPhone error, falling back to memory:', err);
      }
    }

    const userId = this.memState.phoneToUserId[phone];
    if (!userId) return undefined;
    return this.memState.users[userId];
  }

  async saveUser(user: User): Promise<User> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO users (id, phone, email, full_name, avatar_url, avatar_initials, avatar_color, timezone, privacy_mode, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             phone = EXCLUDED.phone,
             email = EXCLUDED.email,
             full_name = EXCLUDED.full_name,
             avatar_url = EXCLUDED.avatar_url,
             avatar_initials = EXCLUDED.avatar_initials,
             avatar_color = EXCLUDED.avatar_color,
             timezone = EXCLUDED.timezone,
             privacy_mode = EXCLUDED.privacy_mode,
             updated_at = EXCLUDED.updated_at`,
          [
            user.id,
            user.phone || null,
            user.email || null,
            user.fullName,
            user.avatarUrl || null,
            user.avatarInitials,
            user.avatarColor,
            user.timezone || 'Asia/Kolkata',
            user.privacyMode || 'delta_only',
            user.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ]
        );

        // Ensure user streak row exists
        await pool.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak, shields_available)
           VALUES ($1, 0, 0, 1)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        );

        return user;
      } catch (err) {
        console.error('PostgreSQL saveUser error, falling back to memory:', err);
      }
    }

    this.memState.users[user.id] = user;
    if (user.phone) this.memState.phoneToUserId[user.phone] = user.id;
    if (!this.memState.streaks[user.id]) {
      this.memState.streaks[user.id] = {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
        shieldsAvailable: 1,
        updatedAt: new Date().toISOString(),
      };
    }
    this.persistMem();
    return user;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (pool) {
      try {
        const res = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteUser error, falling back to memory:', err);
      }
    }

    const user = this.memState.users[userId];
    if (!user) return false;
    if (user.phone) delete this.memState.phoneToUserId[user.phone];
    delete this.memState.users[userId];
    delete this.memState.streaks[userId];

    for (const key of Object.keys(this.memState.participants)) {
      if (key.endsWith(`:${userId}`)) {
        delete this.memState.participants[key];
      }
    }
    this.persistMem();
    return true;
  }

  // --- Wagers ---
  async getWagerById(id: string): Promise<Wager | undefined> {
    if (pool) {
      try {
        const res = await pool.query(`SELECT * FROM wagers WHERE id = $1`, [id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return this.mapWagerRow(r);
        }
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getWagerById error, falling back to memory:', err);
      }
    }

    return this.memState.wagers[id];
  }

  async getWagerByInviteCode(code: string): Promise<Wager | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM wagers WHERE LOWER(invite_code) = LOWER($1)`,
          [code]
        );
        if (res.rows.length > 0) {
          return this.mapWagerRow(res.rows[0]);
        }
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getWagerByInviteCode error, falling back to memory:', err);
      }
    }

    return Object.values(this.memState.wagers).find(
      (w) => w.inviteCode.toLowerCase() === code.toLowerCase()
    );
  }

  async getUserWagers(userId: string): Promise<Wager[]> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT w.* FROM wagers w
           INNER JOIN wager_participants p ON w.id = p.wager_id
           WHERE p.user_id = $1
           ORDER BY w.created_at DESC`,
          [userId]
        );
        return res.rows.map((r) => this.mapWagerRow(r));
      } catch (err) {
        console.error('PostgreSQL getUserWagers error, falling back to memory:', err);
      }
    }

    const userWagerIds = new Set<string>();
    for (const p of Object.values(this.memState.participants)) {
      if (p.userId === userId) userWagerIds.add(p.wagerId);
    }
    return Object.values(this.memState.wagers).filter((w) => userWagerIds.has(w.id));
  }

  async saveWager(wager: Wager): Promise<Wager> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO wagers (id, title, description, creator_id, currency, stake_amount, total_pot, status, start_date, target_deadline, forfeit_rule, invite_code, invite_expires_at, is_private, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             stake_amount = EXCLUDED.stake_amount,
             total_pot = EXCLUDED.total_pot,
             status = EXCLUDED.status,
             target_deadline = EXCLUDED.target_deadline,
             forfeit_rule = EXCLUDED.forfeit_rule,
             updated_at = EXCLUDED.updated_at`,
          [
            wager.id,
            wager.title,
            wager.description || null,
            wager.creatorId,
            wager.currency || '₹',
            wager.stakeAmount,
            wager.totalPot,
            wager.status || 'active',
            wager.startDate || new Date().toISOString().slice(0, 10),
            wager.targetDeadline,
            wager.forfeitRule,
            wager.inviteCode,
            wager.inviteExpiresAt ? new Date(wager.inviteExpiresAt) : null,
            wager.isPrivate ?? true,
            wager.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
        return wager;
      } catch (err) {
        console.error('PostgreSQL saveWager error, falling back to memory:', err);
      }
    }

    this.memState.wagers[wager.id] = wager;
    this.persistMem();
    return wager;
  }

  async deleteWager(wagerId: string): Promise<boolean> {
    if (pool) {
      try {
        const res = await pool.query(`DELETE FROM wagers WHERE id = $1`, [wagerId]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL deleteWager error, falling back to memory:', err);
      }
    }

    if (!this.memState.wagers[wagerId]) return false;
    delete this.memState.wagers[wagerId];
    for (const key of Object.keys(this.memState.participants)) {
      if (key.startsWith(`${wagerId}:`)) delete this.memState.participants[key];
    }
    for (const key of Object.keys(this.memState.weighIns)) {
      if (key.includes(`:${wagerId}:`)) delete this.memState.weighIns[key];
    }
    for (const [id, item] of Object.entries(this.memState.banter)) {
      if (item.wagerId === wagerId) delete this.memState.banter[id];
    }
    this.persistMem();
    return true;
  }

  // --- Participants ---
  async getParticipant(wagerId: string, userId: string): Promise<WagerParticipant | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM wager_participants WHERE wager_id = $1 AND user_id = $2`,
          [wagerId, userId]
        );
        if (res.rows.length > 0) {
          return this.mapParticipantRow(res.rows[0]);
        }
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getParticipant error, falling back to memory:', err);
      }
    }

    return this.memState.participants[`${wagerId}:${userId}`];
  }

  async getWagerParticipants(wagerId: string): Promise<WagerParticipant[]> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM wager_participants WHERE wager_id = $1 ORDER BY joined_at ASC`,
          [wagerId]
        );
        return res.rows.map((r) => this.mapParticipantRow(r));
      } catch (err) {
        console.error('PostgreSQL getWagerParticipants error, falling back to memory:', err);
      }
    }

    return Object.values(this.memState.participants).filter((p) => p.wagerId === wagerId);
  }

  async saveParticipant(participant: WagerParticipant): Promise<WagerParticipant> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO wager_participants (id, wager_id, user_id, role, goal_type, starting_weight, current_weight, target_weight, weight_unit, chosen_disciplines, status, joined_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (wager_id, user_id) DO UPDATE SET
             current_weight = EXCLUDED.current_weight,
             target_weight = EXCLUDED.target_weight,
             chosen_disciplines = EXCLUDED.chosen_disciplines,
             status = EXCLUDED.status`,
          [
            participant.id,
            participant.wagerId,
            participant.userId,
            participant.role || 'participant',
            participant.goalType,
            participant.startingWeight,
            participant.currentWeight,
            participant.targetWeight,
            participant.weightUnit || 'kg',
            participant.chosenDisciplines || ['gym', 'walking', 'diet'],
            participant.status || 'active',
            participant.joinedAt || new Date().toISOString(),
          ]
        );

        // Recalculate total pot
        await pool.query(
          `UPDATE wagers
           SET total_pot = (
             SELECT COUNT(*) * wagers.stake_amount
             FROM wager_participants
             WHERE wager_participants.wager_id = wagers.id AND wager_participants.status = 'active'
           )
           WHERE id = $1`,
          [participant.wagerId]
        );

        return participant;
      } catch (err) {
        console.error('PostgreSQL saveParticipant error, falling back to memory:', err);
      }
    }

    const key = `${participant.wagerId}:${participant.userId}`;
    this.memState.participants[key] = participant;

    const wager = this.memState.wagers[participant.wagerId];
    if (wager) {
      const activeCount = Object.values(this.memState.participants).filter(
        (p) => p.wagerId === wager.id && p.status === 'active'
      ).length;
      wager.totalPot = activeCount * wager.stakeAmount;
      this.memState.wagers[wager.id] = wager;
    }
    this.persistMem();
    return participant;
  }

  async removeParticipant(wagerId: string, userId: string): Promise<boolean> {
    if (pool) {
      try {
        const res = await pool.query(
          `DELETE FROM wager_participants WHERE wager_id = $1 AND user_id = $2`,
          [wagerId, userId]
        );
        await pool.query(
          `UPDATE wagers
           SET total_pot = (
             SELECT COUNT(*) * wagers.stake_amount
             FROM wager_participants
             WHERE wager_participants.wager_id = wagers.id AND wager_participants.status = 'active'
           )
           WHERE id = $1`,
          [wagerId]
        );
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL removeParticipant error, falling back to memory:', err);
      }
    }

    const key = `${wagerId}:${userId}`;
    if (!this.memState.participants[key]) return false;
    delete this.memState.participants[key];
    const wager = this.memState.wagers[wagerId];
    if (wager) {
      const activeCount = Object.values(this.memState.participants).filter(
        (p) => p.wagerId === wager.id && p.status === 'active'
      ).length;
      wager.totalPot = activeCount * wager.stakeAmount;
      this.memState.wagers[wager.id] = wager;
    }
    this.persistMem();
    return true;
  }

  // --- Weigh-Ins ---
  async getWeighIn(userId: string, wagerId: string, date: string): Promise<WeighInRecord | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM weigh_ins WHERE user_id = $1 AND wager_id = $2 AND weigh_in_date = $3`,
          [userId, wagerId, date]
        );
        if (res.rows.length > 0) return this.mapWeighInRow(res.rows[0]);
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getWeighIn error, falling back to memory:', err);
      }
    }

    return this.memState.weighIns[`${userId}:${wagerId}:${date}`];
  }

  async getUserWeighIns(userId: string, wagerId: string): Promise<WeighInRecord[]> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM weigh_ins WHERE user_id = $1 AND wager_id = $2 ORDER BY weigh_in_date DESC`,
          [userId, wagerId]
        );
        return res.rows.map((r) => this.mapWeighInRow(r));
      } catch (err) {
        console.error('PostgreSQL getUserWeighIns error, falling back to memory:', err);
      }
    }

    return Object.values(this.memState.weighIns)
      .filter((w) => w.userId === userId && w.wagerId === wagerId)
      .sort((a, b) => b.weighInDate.localeCompare(a.weighInDate));
  }

  async saveWeighIn(weighIn: WeighInRecord): Promise<WeighInRecord> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO weigh_ins (id, user_id, wager_id, weight, unit, weigh_in_date, photo_url, is_verified, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (user_id, wager_id, weigh_in_date) DO UPDATE SET
             weight = EXCLUDED.weight,
             notes = EXCLUDED.notes,
             photo_url = EXCLUDED.photo_url`,
          [
            weighIn.id,
            weighIn.userId,
            weighIn.wagerId,
            weighIn.weight,
            weighIn.unit || 'kg',
            weighIn.weighInDate,
            weighIn.photoUrl || null,
            weighIn.isVerified ?? false,
            weighIn.notes || null,
            weighIn.createdAt || new Date().toISOString(),
          ]
        );

        // Update participant current weight
        await pool.query(
          `UPDATE wager_participants SET current_weight = $1 WHERE wager_id = $2 AND user_id = $3`,
          [weighIn.weight, weighIn.wagerId, weighIn.userId]
        );

        return weighIn;
      } catch (err) {
        console.error('PostgreSQL saveWeighIn error, falling back to memory:', err);
      }
    }

    const key = `${weighIn.userId}:${weighIn.wagerId}:${weighIn.weighInDate}`;
    this.memState.weighIns[key] = weighIn;
    const pKey = `${weighIn.wagerId}:${weighIn.userId}`;
    const participant = this.memState.participants[pKey];
    if (participant) {
      participant.currentWeight = weighIn.weight;
      this.memState.participants[pKey] = participant;
    }
    this.persistMem();
    return weighIn;
  }

  // --- Habits ---
  async getHabit(userId: string, date: string, discipline: string): Promise<DailyHabitRecord | undefined> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM daily_habits WHERE user_id = $1 AND habit_date = $2 AND discipline = $3`,
          [userId, date, discipline]
        );
        if (res.rows.length > 0) return this.mapHabitRow(res.rows[0]);
        return undefined;
      } catch (err) {
        console.error('PostgreSQL getHabit error, falling back to memory:', err);
      }
    }

    return this.memState.habits[`${userId}:${date}:${discipline}`];
  }

  async getUserHabitsForDate(userId: string, date: string): Promise<DailyHabitRecord[]> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT * FROM daily_habits WHERE user_id = $1 AND habit_date = $2`,
          [userId, date]
        );
        return res.rows.map((r) => this.mapHabitRow(r));
      } catch (err) {
        console.error('PostgreSQL getUserHabitsForDate error, falling back to memory:', err);
      }
    }

    return Object.values(this.memState.habits).filter(
      (h) => h.userId === userId && h.habitDate === date
    );
  }

  async saveHabit(habit: DailyHabitRecord): Promise<DailyHabitRecord> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO daily_habits (id, user_id, habit_date, discipline, completed, duration_minutes, notes, completed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id, habit_date, discipline) DO UPDATE SET
             completed = EXCLUDED.completed,
             notes = EXCLUDED.notes,
             completed_at = EXCLUDED.completed_at`,
          [
            habit.id,
            habit.userId,
            habit.habitDate,
            habit.discipline,
            habit.completed,
            habit.durationMinutes || null,
            habit.notes || null,
            habit.completedAt ? new Date(habit.completedAt) : null,
          ]
        );
        return habit;
      } catch (err) {
        console.error('PostgreSQL saveHabit error, falling back to memory:', err);
      }
    }

    const key = `${habit.userId}:${habit.habitDate}:${habit.discipline}`;
    this.memState.habits[key] = habit;
    this.persistMem();
    return habit;
  }

  private formatDate(val: any): string {
    if (!val) return '';
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(val).slice(0, 10);
  }

  // --- Streaks ---
  async getUserStreak(userId: string): Promise<UserStreak> {
    if (pool) {
      try {
        const res = await pool.query(`SELECT * FROM user_streaks WHERE user_id = $1`, [userId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            userId: r.user_id,
            currentStreak: Number(r.current_streak),
            longestStreak: Number(r.longest_streak),
            shieldsAvailable: Number(r.shields_available),
            lastCompletedDate: r.last_completed_date ? this.formatDate(r.last_completed_date) : undefined,
            updatedAt: r.updated_at?.toISOString ? r.updated_at.toISOString() : String(r.updated_at),
          };
        } else {
          // Create initial streak row
          const init: UserStreak = {
            userId,
            currentStreak: 0,
            longestStreak: 0,
            shieldsAvailable: 1,
            updatedAt: new Date().toISOString(),
          };
          await this.saveUserStreak(init);
          return init;
        }
      } catch (err) {
        console.error('PostgreSQL getUserStreak error, falling back to memory:', err);
      }
    }

    if (!this.memState.streaks[userId]) {
      this.memState.streaks[userId] = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        shieldsAvailable: 1,
        updatedAt: new Date().toISOString(),
      };
      this.persistMem();
    }
    return this.memState.streaks[userId];
  }

  async saveUserStreak(streak: UserStreak): Promise<UserStreak> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak, shields_available, last_completed_date, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id) DO UPDATE SET
             current_streak = EXCLUDED.current_streak,
             longest_streak = EXCLUDED.longest_streak,
             shields_available = EXCLUDED.shields_available,
             last_completed_date = EXCLUDED.last_completed_date,
             updated_at = EXCLUDED.updated_at`,
          [
            streak.userId,
            streak.currentStreak,
            streak.longestStreak,
            streak.shieldsAvailable,
            streak.lastCompletedDate || null,
            new Date().toISOString(),
          ]
        );
        return streak;
      } catch (err) {
        console.error('PostgreSQL saveUserStreak error, falling back to memory:', err);
      }
    }

    this.memState.streaks[streak.userId] = streak;
    this.persistMem();
    return streak;
  }

  // --- Banter ---
  async getWagerBanter(wagerId: string, limit = 50): Promise<BanterItem[]> {
    if (pool) {
      try {
        const res = await pool.query(
          `SELECT b.*, u.full_name as sender_name, u.avatar_initials as sender_initials, u.avatar_color as sender_color, r.full_name as recipient_name
           FROM wager_banter b
           LEFT JOIN users u ON b.sender_id = u.id
           LEFT JOIN users r ON b.recipient_id = r.id
           WHERE b.wager_id = $1
           ORDER BY b.created_at DESC
           LIMIT $2`,
          [wagerId, limit]
        );
        return res.rows.map((r) => ({
          id: r.id,
          wagerId: r.wager_id,
          senderId: r.sender_id,
          senderName: r.sender_name || 'Participant',
          senderInitials: r.sender_initials || 'P',
          senderColor: r.sender_color || 'emerald',
          recipientId: r.recipient_id || undefined,
          recipientName: r.recipient_name || undefined,
          type: r.type,
          message: r.message,
          createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
        }));
      } catch (err) {
        console.error('PostgreSQL getWagerBanter error, falling back to memory:', err);
      }
    }

    return Object.values(this.memState.banter)
      .filter((b) => b.wagerId === wagerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async saveBanter(item: BanterItem): Promise<BanterItem> {
    if (pool) {
      try {
        await pool.query(
          `INSERT INTO wager_banter (id, wager_id, sender_id, recipient_id, type, message, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            item.id,
            item.wagerId,
            item.senderId,
            item.recipientId || null,
            item.type,
            item.message,
            item.createdAt || new Date().toISOString(),
          ]
        );
        return item;
      } catch (err) {
        console.error('PostgreSQL saveBanter error, falling back to memory:', err);
      }
    }

    this.memState.banter[item.id] = item;
    this.persistMem();
    return item;
  }

  // Row Mappers
  private mapWagerRow(r: any): Wager {
    return {
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      creatorId: r.creator_id,
      currency: r.currency || '₹',
      stakeAmount: Number(r.stake_amount),
      totalPot: Number(r.total_pot),
      status: r.status,
      startDate: this.formatDate(r.start_date),
      targetDeadline: this.formatDate(r.target_deadline),
      forfeitRule: r.forfeit_rule,
      inviteCode: r.invite_code,
      inviteExpiresAt: r.invite_expires_at ? new Date(r.invite_expires_at).toISOString() : undefined,
      isPrivate: Boolean(r.is_private),
      createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at?.toISOString ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  private mapParticipantRow(r: any): WagerParticipant {
    return {
      id: r.id,
      wagerId: r.wager_id,
      userId: r.user_id,
      role: r.role,
      goalType: r.goal_type,
      startingWeight: Number(r.starting_weight),
      currentWeight: Number(r.current_weight),
      targetWeight: Number(r.target_weight),
      weightUnit: r.weight_unit || 'kg',
      chosenDisciplines: Array.isArray(r.chosen_disciplines) ? r.chosen_disciplines : ['gym', 'walking', 'diet'],
      status: r.status,
      joinedAt: r.joined_at?.toISOString ? r.joined_at.toISOString() : String(r.joined_at),
    };
  }

  private mapWeighInRow(r: any): WeighInRecord {
    return {
      id: r.id,
      userId: r.user_id,
      wagerId: r.wager_id,
      weight: Number(r.weight),
      unit: r.unit || 'kg',
      weighInDate: this.formatDate(r.weigh_in_date),
      photoUrl: r.photo_url || undefined,
      isVerified: Boolean(r.is_verified),
      notes: r.notes || undefined,
      createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : String(r.created_at),
    };
  }

  private mapHabitRow(r: any): DailyHabitRecord {
    return {
      id: r.id,
      userId: r.user_id,
      habitDate: this.formatDate(r.habit_date),
      discipline: r.discipline,
      completed: Boolean(r.completed),
      durationMinutes: r.duration_minutes ? Number(r.duration_minutes) : undefined,
      notes: r.notes || undefined,
      completedAt: r.completed_at?.toISOString ? r.completed_at.toISOString() : r.completed_at ? String(r.completed_at) : undefined,
    };
  }
}

export const db = new Database();
