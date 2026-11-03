import crypto from 'crypto';
import { db } from '../db/database.js';
import { BanterItem, BanterType, User } from '../types.js';

export class BanterService {
  static async getWagerBanter(wagerId: string, limit = 50): Promise<BanterItem[]> {
    return await db.getWagerBanter(wagerId, limit);
  }

  static async postBanter(
    sender: User,
    wagerId: string,
    data: {
      type: BanterType;
      message: string;
      recipientId?: string;
    }
  ): Promise<BanterItem> {
    let recipientName: string | undefined;
    if (data.recipientId) {
      const recipient = await db.getUserById(data.recipientId);
      recipientName = recipient?.fullName;
    }

    const item: BanterItem = {
      id: crypto.randomUUID(),
      wagerId,
      senderId: sender.id,
      senderName: sender.fullName,
      senderInitials: sender.avatarInitials,
      senderColor: sender.avatarColor,
      recipientId: data.recipientId,
      recipientName,
      type: data.type,
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    return await db.saveBanter(item);
  }
}
