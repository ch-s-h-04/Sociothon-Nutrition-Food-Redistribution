import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSurplusListing,
  getAllSurplusListings,
  getSurplusListingById,
  updateSurplusStatus,
  deleteSurplusListing,
  calculateFoodWeightKg
} from '../server/services/surplusService.ts';
import { store } from '../server/db/store.ts';

test('Surplus: calculateFoodWeightKg converts standard meals to kilograms', () => {
  assert.equal(calculateFoodWeightKg(100), 38.0);
  assert.equal(calculateFoodWeightKg(50), 19.0);
  assert.equal(calculateFoodWeightKg(10), 3.8);
});

test('Surplus: CRUD lifecycle maintains persistent records and status transitions', () => {
  store.reset();
  const initialCount = getAllSurplusListings().length;

  const created = createSurplusListing({
    donor_name: 'Test Hackathon Donor Canteen',
    pickup_address: '100 Ring Road, Jayanagar',
    pickup_district: 'Bengaluru Urban',
    pickup_state: 'Karnataka',
    latitude: 12.9250,
    longitude: 77.5850,
    food_type: 'cooked meals',
    dietary_type: 'vegetarian',
    quantity_meals: 80,
    storage_requirement: 'hot_holding',
    expiry_at: new Date(Date.now() + 120 * 60000).toISOString(),
    contact_name: 'Kavitha R',
    contact_phone: '+91 99000 11223'
  });

  assert.ok(created.id.startsWith('S-'));
  assert.equal(created.quantity_meals, 80);
  assert.equal(created.food_weight_kg, 30.4);
  assert.equal(created.status, 'available');
  assert.equal(getAllSurplusListings().length, initialCount + 1);

  // Status update
  const updated = updateSurplusStatus(created.id, 'assigned');
  assert.equal(updated.status, 'assigned');

  // Verify retrieval
  const fetched = getSurplusListingById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.status, 'assigned');

  // Delete
  const deleted = deleteSurplusListing(created.id);
  assert.equal(deleted, true);
  assert.equal(getSurplusListingById(created.id), undefined);
});
