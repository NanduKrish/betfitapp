import crypto from 'crypto';
import { db } from '../db/database.js';
import { WeighInRecord } from '../types.js';

export class WeighInService {
  static async logWeighIn(
    userId: string,
    wagerId: string,
    data: {
      weight: number;
      weighInDate?: string;
      notes?: string;
      photoUrl?: string;
      unit?: 'kg' | 'lbs';
    }
  ): Promise<WeighInRecord> {
    const today = new Date().toISOString().slice(0, 10);
    const date = data.weighInDate || today;

    // Check if user is a participant
    const participant = await db.getParticipant(wagerId, userId);
    if (!participant) {
      throw new Error('User is not a participant in this wager');
    }

    const existing = await db.getWeighIn(userId, wagerId, date);
    const record: WeighInRecord = {
      id: existing?.id || crypto.randomUUID(),
      userId,
      wagerId,
      weight: data.weight,
      unit: data.unit || 'kg',
      weighInDate: date,
      notes: data.notes || existing?.notes,
      photoUrl: data.photoUrl || existing?.photoUrl,
      isVerified: false,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    return await db.saveWeighIn(record);
  }

  static async getHistory(userId: string, wagerId: string): Promise<WeighInRecord[]> {
    return await db.getUserWeighIns(userId, wagerId);
  }
}
