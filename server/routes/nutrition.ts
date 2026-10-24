import express, { type Request, type Response } from 'express';
import {
  getAllDistrictSummaries,
  getDistrictById,
  getStateNutritionOverview
} from '../services/nutritionService.ts';

const router = express.Router();

// GET /api/nutrition/districts - List all districts with risk summaries
router.get('/districts', (_req: Request, res: Response) => {
  try {
    const districts = getAllDistrictSummaries();
    res.json({
      total: districts.length,
      districts,
      metadata: {
        data_source: 'NFHS-5 (National Family Health Survey, 2019-21) Factsheets & PIB',
        methodology: 'Observed epidemiological statistics with multi-factor risk categorization',
        last_updated: '2026-03'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve nutrition districts', details: err.message });
  }
});

// GET /api/nutrition/districts/:id - District detail & micronutrient risks
router.get('/districts/:id', (req: Request, res: Response) => {
  try {
    const profile = getDistrictById(req.params.id);
    if (!profile) {
      res.status(404).json({ error: `District '${req.params.id}' not found in NFHS-5 factsheet dataset` });
      return;
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve district profile', details: err.message });
  }
});

// GET /api/nutrition/states - State-level aggregated nutrition overview
router.get('/states', (_req: Request, res: Response) => {
  try {
    const states = getStateNutritionOverview();
    res.json({ states });
  } catch (err: any) {
    res.status(500).json({ error: 'State overview failed', details: err.message });
  }
});

export default router;
