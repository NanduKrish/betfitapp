import crypto from 'crypto';
import { db } from '../db/database.js';
import { User } from '../types.js';
import { signToken } from '../middleware/auth.js';

export class AuthService {
  static sendOtp(phone: string): { success: boolean; message: string; devOtp?: string } {
    // Generate 6-digit random numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in database with 5 min expiry
    db.setOtp(phone, otp);

    // In a live production environment with TWILIO_ACCOUNT_SID or MSG91_AUTH_KEY:
    // await sendSmsOrWhatsApp(phone, `Your BetFit Arena code is ${otp}`);
    console.log(`[AUTH OTP] Sent code ${otp} to phone ${phone}`);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      message: 'OTP sent successfully',
      devOtp: isDev ? otp : undefined,
    };
  }

  static verifyOtp(phone: string, otp: string, fullName?: string): { token: string; user: User } {
    const isValid = db.verifyOtp(phone, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    let user = db.getUserByPhone(phone);
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
      db.saveUser(user);
    } else if (fullName && fullName.trim() && user.fullName !== fullName.trim()) {
      user.fullName = fullName.trim();
      user.updatedAt = new Date().toISOString();
      db.saveUser(user);
    }

    const token = signToken(user);
    return { token, user };
  }

  static googleSignIn(email: string, name: string): { token: string; user: User } {
    // Check if user exists by email/id
    let user = Object.values(db.getUserById(email) ? [db.getUserById(email)!] : []).find(
      (u) => u.email === email
    );

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
      db.saveUser(user);
    }

    const token = signToken(user);
    return { token, user };
  }
}
