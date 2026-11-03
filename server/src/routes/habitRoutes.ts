import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { HabitService } from '../services/habitService.js';
import { ToggleHabitSchema } from '../types.js';

const router = Router();

// Get today's habits
router.get('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateStr = req.query.date as string | undefined;
    const habits = await HabitService.getTodayHabits(req.user!.id, dateStr);
    res.json({ habits });
  } catch (err) {
    next(err);
  }
});

// Toggle habit completion
router.post('/toggle', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ToggleHabitSchema.parse(req.body);
    const result = await HabitService.toggleHabit(
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
router.get('/stats', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await HabitService.getStreakStats(req.user!.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

// Use a streak shield
router.post('/shield', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await HabitService.useShield(req.user!.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

export default router;
