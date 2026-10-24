import express, { type Request, type Response } from 'express';
import { findNGORecommendations } from '../services/matchingService.ts';

const router = express.Router();

// POST /api/matching/recommend - Rank NGOs with nutrition intelligence & constraints
router.post('/recommend', (req: Request, res: Response) => {
  try {
    const { event_id, eventId, now } = req.body;
    const targetId = event_id || eventId;
    if (!targetId) {
      res.status(400).json({ error: 'event_id is required' });
      return;
    }
    const result = findNGORecommendations(targetId, now);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: 'Matching failed', details: err.message });
  }
});

// GET /api/matching/recommend/:eventId - Shortcut lookup
router.get('/recommend/:eventId', (req: Request, res: Response) => {
  try {
    const result = findNGORecommendations(req.params.eventId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: 'Matching failed', details: err.message });
  }
});

export default router;
