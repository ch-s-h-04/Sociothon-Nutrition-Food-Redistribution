import express, { type Request, type Response } from 'express';
import {
  getAllSurplusListings,
  getSurplusListingById,
  createSurplusListing,
  updateSurplusStatus,
  deleteSurplusListing
} from '../services/surplusService.ts';
import type { SurplusStatus } from '../types/index.ts';

const router = express.Router();

// GET /api/surplus - Get all surplus listings with optional status filter
router.get('/', (req: Request, res: Response) => {
  try {
    const status = req.query.status as SurplusStatus | undefined;
    const listings = getAllSurplusListings(status);
    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch surplus listings', details: err.message });
  }
});

// GET /api/surplus/:id - Get specific surplus listing
router.get('/:id', (req: Request, res: Response) => {
  try {
    const listing = getSurplusListingById(req.params.id);
    if (!listing) {
      res.status(404).json({ error: `Surplus listing '${req.params.id}' not found` });
      return;
    }
    res.json(listing);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch surplus listing', details: err.message });
  }
});

// POST /api/surplus - Register new food surplus
router.post('/', (req: Request, res: Response) => {
  try {
    const created = createSurplusListing(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/surplus/:id/status - Update surplus listing status
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status, assigned_ngo_id, assigned_vehicle_id, delivery_id } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }
    const updated = updateSurplusStatus(req.params.id, status, { assigned_ngo_id, assigned_vehicle_id, delivery_id });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/surplus/:id - Remove surplus listing
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = deleteSurplusListing(req.params.id);
    if (!success) {
      res.status(404).json({ error: `Surplus listing '${req.params.id}' not found` });
      return;
    }
    res.json({ success: true, message: `Surplus listing ${req.params.id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete surplus listing', details: err.message });
  }
});

export default router;
