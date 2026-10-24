import express, { type Request, type Response } from 'express';
import { store } from '../db/store.ts';
import type { RestaurantDonor, RecipientNGO } from '../types/index.ts';
import { getProviderLeaderboard, PROVIDER_TRUST_METHOD } from '../services/providerTrustService.ts';

const router = express.Router();

// Restaurants
router.get('/restaurants', (_req: Request, res: Response) => {
  res.json(store.getRestaurants());
});

// Public provider reputation leaderboard, derived from verified platform activity.
router.get('/providers/leaderboard', (_req: Request, res: Response) => {
  res.json({
    providers: getProviderLeaderboard(),
    methodology: PROVIDER_TRUST_METHOD
  });
});

router.post('/restaurants', (req: Request, res: Response) => {
  try {
    const { name, type, latitude, longitude, address, district, state, contact_phone, contact_email } = req.body;
    if (!name || !latitude || !longitude) {
      res.status(400).json({ error: 'Name, latitude, and longitude are required' });
      return;
    }
    const newR: RestaurantDonor = {
      id: `R${String(store.getRestaurants().length + 1).padStart(2, '0')}`,
      name,
      type: type || 'restaurant',
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || 'Local Address',
      district: district || 'Central Zone',
      state: state || 'State',
      operating_hours: req.body.operating_hours || '08:00–23:00',
      contact_phone: contact_phone || '+91 90000 00000',
      contact_email: contact_email || 'donor@example.com',
      food_preferences: req.body.food_preferences || ['cooked meals'],
      historical_surplus: 25,
      average_daily_orders: 150,
      reliability_score: 90,
      active: true
    };
    const created = store.addRestaurant(newR);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// NGOs
router.get('/ngos', (_req: Request, res: Response) => {
  res.json(store.getNGOs());
});

router.post('/ngos', (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude, address, district, state, daily_capacity_meals, contact_phone, contact_person } = req.body;
    if (!name || !latitude || !longitude) {
      res.status(400).json({ error: 'Name, latitude, and longitude are required' });
      return;
    }
    const ngoId = `N${String(store.getNGOs().length + 1).padStart(2, '0')}`;
    const newNgo: RecipientNGO = {
      id: ngoId,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || 'Service Center',
      district: district || 'District',
      state: state || 'State',
      service_radius_km: Number(req.body.service_radius_km || 15),
      daily_capacity_meals: Number(daily_capacity_meals || 200),
      current_capacity_meals: Number(daily_capacity_meals || 200),
      accepted_food_types: req.body.accepted_food_types || ['cooked meals', 'rice', 'bread'],
      accepted_dietary_types: req.body.accepted_dietary_types || ['vegetarian', 'mixed'],
      storage_capabilities: req.body.storage_capabilities || ['ambient'],
      operating_hours: req.body.operating_hours || '08:00–22:00',
      contact_phone: contact_phone || '+91 90000 00000',
      contact_person: contact_person || 'Coordinator',
      vehicle_available: req.body.vehicle_available !== false,
      reliability_score: 92,
      active: true,
      target_demographics: req.body.target_demographics || ['Community Beneficiaries', 'Vulnerable Households']
    };
    const created = store.addNGO(newNgo);

    // If vehicle is available, auto-provision fleet vehicle for dispatch
    if (newNgo.vehicle_available) {
      const vehicleId = `V-${ngoId}`;
      if (!store.getVehicleById(vehicleId)) {
        store.addVehicle({
          id: vehicleId,
          ngo_id: ngoId,
          driver_name: req.body.driver_name || `${contact_person || 'Dispatch'} Driver`,
          driver_phone: req.body.driver_phone || contact_phone || '+91 90000 00000',
          capacity_meals: Number(req.body.vehicle_capacity || Math.min(150, newNgo.daily_capacity_meals)),
          current_latitude: newNgo.latitude,
          current_longitude: newNgo.longitude,
          available_at: new Date().toISOString(),
          status: 'available'
        });
      }
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Vehicles
router.get('/vehicles', (_req: Request, res: Response) => {
  res.json(store.getVehicles());
});

// Reset database endpoint (for demo / testing)
router.post('/admin/reset', (_req: Request, res: Response) => {
  store.reset();
  res.json({ message: 'Database reset to initial demo state' });
});

export default router;
