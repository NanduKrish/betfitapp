import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { SendOtpSchema, VerifyOtpSchema } from '../types.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Send OTP via SMS / WhatsApp
router.post('/otp/send', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = SendOtpSchema.parse(req.body);
    const result = AuthService.sendOtp(phone);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Verify OTP & Issue Token
router.post('/otp/verify', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp, fullName } = VerifyOtpSchema.parse(req.body);
    const { token, user } = AuthService.verifyOtp(phone, otp, fullName);

    // Set secure HTTP-only cookie
    res.cookie('betfit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Google One-Tap Sign In
router.post('/google', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const { token, user } = AuthService.googleSignIn(email, name);

    res.cookie('betfit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Get Current Authenticated User
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('betfit_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
