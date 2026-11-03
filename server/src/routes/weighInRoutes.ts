import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { WeighInService } from '../services/weighInService.js';
import { LogWeighInSchema } from '../types.js';

const router = Router();

// Log weigh-in
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LogWeighInSchema.parse(req.body);
    const record = await WeighInService.logWeighIn(req.user!.id, data.wagerId, data);
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
});

// Get weigh-in history for a wager
router.get('/:wagerId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await WeighInService.getHistory(req.user!.id, req.params.wagerId as string);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

export default router;
