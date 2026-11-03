import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { WagerService } from '../services/wagerService.js';
import { CreateWagerSchema, JoinWagerSchema } from '../types.js';

const router = Router();

// Preview invite link (Public - no auth required to view details before joining)
router.get('/invite/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const preview = await WagerService.previewInvite(req.params.code as string);
    if (!preview) {
      return res.status(404).json({ error: 'Showdown not found or invite expired' });
    }
    res.json({ wager: preview });
  } catch (err) {
    next(err);
  }
});

// List all wagers for authenticated user
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wagers = await WagerService.getWagersForUser(req.user!.id);
    res.json({ wagers });
  } catch (err) {
    next(err);
  }
});

// Create new wager showdown
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateWagerSchema.parse(req.body);
    const result = await WagerService.createWager(req.user!, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Get wager details
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wager = await WagerService.getWagerById(req.params.id as string);
    if (!wager) {
      return res.status(404).json({ error: 'Wager not found' });
    }
    res.json({ wager });
  } catch (err) {
    next(err);
  }
});

// Join wager
router.post('/:id/join', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = JoinWagerSchema.parse(req.body);
    const result = await WagerService.joinWager(req.user!, req.params.id as string, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Update wager terms (Owner only)
router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await WagerService.updateWager(req.user!.id, req.params.id as string, req.body);
    res.json({ wager: updated });
  } catch (err) {
    next(err);
  }
});

// Delete wager (Owner only)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const success = await WagerService.deleteWager(req.user!.id, req.params.id as string);
    if (!success) {
      return res.status(404).json({ error: 'Wager not found' });
    }
    res.json({ success: true, message: 'Wager deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
