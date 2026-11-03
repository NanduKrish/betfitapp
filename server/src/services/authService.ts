import crypto from 'crypto';
import { db } from '../db/database.js';
import { User } from '../types.js';
import { signToken } from '../middleware/auth.js';

export class AuthService {
  static async sendOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    // Generate 6-digit random numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in database with 5 min expiry
    await db.setOtp(phone, otp);

    console.log(`[AUTH OTP] Sent code ${otp} to phone ${phone}`);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      message: 'OTP sent successfully',
      devOtp: isDev ? otp : undefined,
    };
  }

  static async verifyOtp(phone: string, otp: string, fullName?: string): Promise<{ token: string; user: User }> {
    const isValid = await db.verifyOtp(phone, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    let user = await db.getUserByPhone(phone);
    if (!user) {
      // New user signup
      const id = crypto.randomUUID();
      const initials = (fullName || 'User')
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      user = {
        id,
        phone,
        fullName: fullName || `User ${phone.slice(-4)}`,
        avatarInitials: initials || 'U',
        avatarColor: 'emerald',
        timezone: 'Asia/Kolkata',
        privacyMode: 'delta_only',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.saveUser(user);
    } else if (fullName && fullName.trim() && user.fullName !== fullName.trim()) {
      user.fullName = fullName.trim();
      user.updatedAt = new Date().toISOString();
      await db.saveUser(user);
    }

    const token = signToken(user);
    return { token, user };
  }

  static async googleSignIn(email: string, name: string): Promise<{ token: string; user: User }> {
    let user = await db.getUserById(email);

    if (!user) {
      const id = crypto.randomUUID();
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      user = {
        id,
        email,
        fullName: name,
        avatarInitials: initials || 'G',
        avatarColor: 'cyan',
        timezone: 'Asia/Kolkata',
        privacyMode: 'delta_only',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.saveUser(user);
    }

    const token = signToken(user);
    return { token, user };
  }
}
