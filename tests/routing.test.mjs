import test from 'node:test';
import assert from 'node:assert/strict';
import {
  optimizeFleetRoutes,
  optimizeHubLocations,
  generateInterpolatedWaypoints
} from '../server/services/routingService.ts';
import { store } from '../server/db/store.ts';

test('Routing: generateInterpolatedWaypoints produces valid coordinate paths', () => {
  const start = [12.9716, 77.5946];
  const end = [13.0358, 77.5970];
  const waypoints = generateInterpolatedWaypoints(start, end, 3);
  assert.equal(waypoints.length, 5, 'Should have start + 3 intermediates + end');
  assert.deepEqual(waypoints[0], start);
  assert.deepEqual(waypoints[waypoints.length - 1], end);
});

test('Routing: optimizeFleetRoutes respects vehicle capacities and deadline feasibility', () => {
  store.reset();
  const result = optimizeFleetRoutes();
  assert.ok(result, 'Optimization result returned');
  assert.equal(result.routing_engine, 'deterministic_nearest_expiry_first_with_road_circuity');
  assert.ok(result.total_meals_rescued >= 0, 'Meals rescued should be non-negative');

  for (const route of result.routes) {
    assert.ok(route.total_load_meals <= route.capacity_meals, `Vehicle load ${route.total_load_meals} exceeds capacity ${route.capacity_meals}`);
    assert.equal(route.is_deadline_feasible, true);
    assert.ok(route.stops.length > 0);
    assert.ok(route.waypoints.length > 0);
  }
});

test('Routing: optimizeHubLocations selects medoids among donor locations', () => {
  const k = 2;
  const result = optimizeHubLocations(k);
  assert.equal(result.hubs.length, k);
  for (const hub of result.hubs) {
    assert.ok(hub.donors_served_count >= 1);
    assert.ok(hub.recommended_hub_location.latitude);
    assert.ok(hub.recommended_hub_location.longitude);
  }
});
