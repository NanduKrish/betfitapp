import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { HabitService } from '../services/habitService.js';
import { ToggleHabitSchema } from '../types.js';

const router = Router();

// Get today's habits
router.get('/today', requireAuth, (req: Request, res: Response) => {
  const dateStr = req.query.date as string | undefined;
  const habits = HabitService.getTodayHabits(req.user!.id, dateStr);
  res.json({ habits });
});

// Toggle habit completion
router.post('/toggle', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ToggleHabitSchema.parse(req.body);
    const result = HabitService.toggleHabit(
      req.user!.id,
      data.discipline,
      data.completed,
      data.habitDate,
      data.notes
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get streak stats
router.get('/stats', requireAuth, (req: Request, res: Response) => {
  const stats = HabitService.getStreakStats(req.user!.id);
  res.json({ stats });
});

// Use a streak shield
router.post('/shield', requireAuth, (req: Request, res: Response) => {
  const stats = HabitService.useShield(req.user!.id);
  res.json({ stats });
});

export default router;
