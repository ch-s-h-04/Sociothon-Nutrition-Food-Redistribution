import express, { type Request, type Response } from 'express';
import { getPlatformImpactMetrics } from '../services/impactService.ts';

const router = express.Router();

// GET /api/impact - Unified operations & India paradox metrics
router.get('/', (_req: Request, res: Response) => {
  try {
    const metrics = getPlatformImpactMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate impact metrics', details: err.message });
  }
});

export default router;
