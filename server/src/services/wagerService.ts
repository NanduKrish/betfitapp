import crypto from 'crypto';
import { db } from '../db/database.js';
import { Wager, WagerParticipant, User } from '../types.js';

export class WagerService {
  static generateInviteCode(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${slug || 'BET'}-${rand}`;
  }

  static createWager(
    creator: User,
    data: {
      title: string;
      description?: string;
      currency?: string;
      stakeAmount: number;
      startDate?: string;
      targetDeadline: string;
      forfeitRule: string;
      goalType: 'loss' | 'gain';
      startingWeight: number;
      targetWeight: number;
      chosenDisciplines: string[];
    }
  ): { wager: Wager; participant: WagerParticipant } {
    const wagerId = crypto.randomUUID();
    const inviteCode = this.generateInviteCode(data.title);
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    const wager: Wager = {
      id: wagerId,
      title: data.title,
      description: data.description,
      creatorId: creator.id,
      currency: data.currency || '₹',
      stakeAmount: data.stakeAmount,
      totalPot: data.stakeAmount, // Starts with creator's stake
      status: 'active',
      startDate: data.startDate || today,
      targetDeadline: data.targetDeadline,
      forfeitRule: data.forfeitRule,
      inviteCode,
      isPrivate: true,
      createdAt: now,
      updatedAt: now,
    };

    db.saveWager(wager);

    // Creator is the initial owner participant
    const participantId = crypto.randomUUID();
    const participant: WagerParticipant = {
      id: participantId,
      wagerId,
      userId: creator.id,
      role: 'owner',
      goalType: data.goalType,
      startingWeight: data.startingWeight,
      currentWeight: data.startingWeight,
      targetWeight: data.targetWeight,
      weightUnit: 'kg',
      chosenDisciplines: data.chosenDisciplines,
      status: 'active',
      joinedAt: now,
    };

    db.saveParticipant(participant);

    return { wager, participant };
  }

  static getWagersForUser(userId: string): Wager[] {
    return db.getUserWagers(userId);
  }

  static getWagerById(wagerId: string) {
    const wager = db.getWagerById(wagerId);
    if (!wager) return null;
    const participants = db.getWagerParticipants(wagerId);
    return {
      ...wager,
      participantCount: participants.length,
      participants,
    };
  }

  static previewInvite(code: string) {
    const wager = db.getWagerByInviteCode(code);
    if (!wager) return null;

    const creator = db.getUserById(wager.creatorId);
    const participants = db.getWagerParticipants(wager.id);

    return {
      id: wager.id,
      title: wager.title,
      description: wager.description,
      creatorName: creator?.fullName || 'Creator',
      currency: wager.currency,
      stakeAmount: wager.stakeAmount,
      totalPot: wager.totalPot,
      targetDeadline: wager.targetDeadline,
      forfeitRule: wager.forfeitRule,
      inviteCode: wager.inviteCode,
      participantCount: participants.length,
    };
  }

  static joinWager(
    user: User,
    wagerId: string,
    data: {
      goalType: 'loss' | 'gain';
      startingWeight: number;
      targetWeight: number;
      chosenDisciplines: string[];
    }
  ): { wager: Wager; participant: WagerParticipant } {
    const wager = db.getWagerById(wagerId);
    if (!wager) {
      throw new Error('Wager not found');
    }

    if (wager.status !== 'active') {
      throw new Error(`Cannot join wager with status: ${wager.status}`);
    }

    let existingParticipant = db.getParticipant(wagerId, user.id);
    if (existingParticipant) {
      throw new Error('You are already a participant in this wager showdown');
    }

    const participantId = crypto.randomUUID();
    const participant: WagerParticipant = {
      id: participantId,
      wagerId,
      userId: user.id,
      role: 'participant',
      goalType: data.goalType,
      startingWeight: data.startingWeight,
      currentWeight: data.startingWeight,
      targetWeight: data.targetWeight,
      weightUnit: 'kg',
      chosenDisciplines: data.chosenDisciplines,
      status: 'active',
      joinedAt: new Date().toISOString(),
    };

    db.saveParticipant(participant);

    // Refresh wager pot
    const updatedWager = db.getWagerById(wagerId)!;
    return { wager: updatedWager, participant };
  }

  static updateWager(
    userId: string,
    wagerId: string,
    updates: Partial<Pick<Wager, 'title' | 'description' | 'targetDeadline' | 'forfeitRule' | 'stakeAmount'>>
  ): Wager {
    const wager = db.getWagerById(wagerId);
    if (!wager) throw new Error('Wager not found');

    const participant = db.getParticipant(wagerId, userId);
    if (!participant || participant.role !== 'owner') {
      throw new Error('Only the wager owner can update terms');
    }

    if (updates.title) wager.title = updates.title;
    if (updates.description !== undefined) wager.description = updates.description;
    if (updates.targetDeadline) wager.targetDeadline = updates.targetDeadline;
    if (updates.forfeitRule) wager.forfeitRule = updates.forfeitRule;
    if (updates.stakeAmount && updates.stakeAmount > 0) {
      wager.stakeAmount = updates.stakeAmount;
      const participants = db.getWagerParticipants(wagerId);
      wager.totalPot = participants.length * wager.stakeAmount;
    }
    wager.updatedAt = new Date().toISOString();

    return db.saveWager(wager);
  }

  static deleteWager(userId: string, wagerId: string): boolean {
    const wager = db.getWagerById(wagerId);
    if (!wager) return false;

    const participant = db.getParticipant(wagerId, userId);
    if (!participant || participant.role !== 'owner') {
      throw new Error('Only the wager owner can delete the wager showdown');
    }

    return db.deleteWager(wagerId);
  }
}
