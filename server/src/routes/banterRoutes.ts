import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { BanterService } from '../services/banterService.js';
import { CreateBanterSchema } from '../types.js';

const router = Router();

// Get banter for a wager
router.get('/:wagerId', requireAuth, (req: Request, res: Response) => {
  const banter = BanterService.getWagerBanter(req.params.wagerId as string);
  res.json({ banter });
});

// Post banter message
router.post('/:wagerId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateBanterSchema.parse(req.body);
    const item = BanterService.postBanter(req.user!, req.params.wagerId as string, data);
    res.status(201).json({ item });

  } catch (err) {
    next(err);
  }
});

export default router;
