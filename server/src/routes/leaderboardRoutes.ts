import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { LeaderboardService } from '../services/leaderboardService.js';

const router = Router();

// Get real-time ranked leaderboard for a wager
router.get('/:wagerId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = LeaderboardService.getLeaderboard(req.params.wagerId as string);
    res.json({ leaderboard });

  } catch (err) {
    next(err);
  }
});

export default router;
