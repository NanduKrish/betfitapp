import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db/database.js';
import { UpdateProfileSchema } from '../types.js';

const router = Router();

// Get profile
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// Update profile
router.put('/profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = UpdateProfileSchema.parse(req.body);
    const user = req.user!;

    if (data.fullName) user.fullName = data.fullName;
    if (data.avatarInitials) user.avatarInitials = data.avatarInitials;
    if (data.avatarColor) user.avatarColor = data.avatarColor;
    if (data.timezone) user.timezone = data.timezone;
    if (data.privacyMode) user.privacyMode = data.privacyMode;
    user.updatedAt = new Date().toISOString();

    const updated = await db.saveUser(user);
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

// Delete user account
router.delete('/me', requireAuth, async (req: Request, res: Response) => {
  const success = await db.deleteUser(req.user!.id);
  res.clearCookie('betfit_token');
  res.json({ success, message: 'User account and associated records deleted' });
});

export default router;
