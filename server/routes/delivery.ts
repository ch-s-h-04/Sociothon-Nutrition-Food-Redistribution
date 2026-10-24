import express, { type Request, type Response } from 'express';
import {
  assignDonationToNGO,
  updateDeliveryStatus,
  getAllDeliveries,
  getDeliveryById
} from '../services/deliveryService.ts';

const router = express.Router();

// GET /api/deliveries - List all delivery dispatches
router.get('/', (_req: Request, res: Response) => {
  try {
    const list = getAllDeliveries();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch deliveries', details: err.message });
  }
});

// GET /api/deliveries/:id - Get single delivery
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = getDeliveryById(req.params.id);
    if (!item) {
      res.status(404).json({ error: `Delivery record '${req.params.id}' not found` });
      return;
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch delivery', details: err.message });
  }
});

// POST /api/deliveries/assign - Assign surplus food donation to NGO
router.post('/assign', (req: Request, res: Response) => {
  try {
    const { surplus_id, ngo_id, vehicle_id } = req.body;
    if (!surplus_id || !ngo_id) {
      res.status(400).json({ error: 'surplus_id and ngo_id are required' });
      return;
    }
    const delivery = assignDonationToNGO({ surplus_id, ngo_id, vehicle_id });
    res.status(201).json(delivery);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/deliveries/:id/status - Update delivery status
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['assigned', 'in_transit', 'delivered', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Valid status required: assigned | in_transit | delivered | cancelled' });
      return;
    }
    const updated = updateDeliveryStatus(req.params.id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
