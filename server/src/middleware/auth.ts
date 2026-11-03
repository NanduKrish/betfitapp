import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { User, ParticipantRole } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'betfit-secret-production-key-2026';
const JWT_EXPIRES_IN = '30d';

export interface AuthUserPayload {
  userId: string;
  phone?: string;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function signToken(user: User): string {
  const payload: AuthUserPayload = {
    userId: user.id,
    phone: user.phone,
    fullName: user.fullName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Check HTTP-only cookie fallback
  if (!token && req.cookies && req.cookies.betfit_token) {
    token = req.cookies.betfit_token;
  }

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (payload) {
    try {
      const user = await db.getUserById(payload.userId);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      console.error('Error fetching user in authMiddleware:', err);
    }
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required to access this resource',
    });
  }
  next();
}

export function requireWagerRole(allowedRoles: ParticipantRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const wagerId = req.params.wagerId || req.params.id || req.body.wagerId;
    if (!wagerId) {
      return res.status(400).json({ error: 'Wager ID is required' });
    }

    const participant = await db.getParticipant(wagerId, req.user.id);
    if (!participant) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a participant of this wager showdown',
      });
    }

    if (!allowedRoles.includes(participant.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Requires one of: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
