import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { WagerService } from '../services/wagerService.js';
import { CreateWagerSchema, JoinWagerSchema } from '../types.js';

const router = Router();

// Preview invite link (Public - no auth required to view details before joining)
router.get('/invite/:code', (req: Request, res: Response) => {
  const preview = WagerService.previewInvite(req.params.code);
  if (!preview) {
    return res.status(404).json({ error: 'Showdown not found or invite expired' });
  }
  res.json({ wager: preview });
});

// List all wagers for authenticated user
router.get('/', requireAuth, (req: Request, res: Response) => {
  const wagers = WagerService.getWagersForUser(req.user!.id);
  res.json({ wagers });
});

// Create new wager showdown
router.post('/', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateWagerSchema.parse(req.body);
    const result = WagerService.createWager(req.user!, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Get wager details
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const wager = WagerService.getWagerById(req.params.id);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }
  res.json({ wager });
});

// Join wager
router.post('/:id/join', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = JoinWagerSchema.parse(req.body);
    const result = WagerService.joinWager(req.user!, req.params.id, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Update wager terms (Owner only)
router.put('/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = WagerService.updateWager(req.user!.id, req.params.id, req.body);
    res.json({ wager: updated });
  } catch (err) {
    next(err);
  }
});

// Delete wager (Owner only)
router.delete('/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const success = WagerService.deleteWager(req.user!.id, req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Wager not found' });
    }
    res.json({ success: true, message: 'Wager deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
