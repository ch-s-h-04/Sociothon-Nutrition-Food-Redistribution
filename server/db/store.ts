import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RestaurantDonor, RecipientNGO, FleetVehicle, SurplusEvent, DeliveryRecord, ProviderRating } from '../types/index.ts';
import { initialRestaurants, initialNGOs, initialVehicles, initialSurplusEvents } from './initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

export interface DatabaseSchema {
  restaurants: RestaurantDonor[];
  ngos: RecipientNGO[];
  vehicles: FleetVehicle[];
  surplusEvents: SurplusEvent[];
  deliveries: DeliveryRecord[];
  providerRatings: ProviderRating[];
  lastUpdated: string;
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          if (parsed.restaurants && parsed.ngos && parsed.surplusEvents) {
            return { ...parsed, providerRatings: parsed.providerRatings || [] };
          }
        }
      }
    } catch (err) {
      console.warn('Could not read existing db.json, creating initial store:', err);
    }

    const initial: DatabaseSchema = {
      restaurants: [...initialRestaurants],
      ngos: [...initialNGOs],
      vehicles: [...initialVehicles],
      surplusEvents: [...initialSurplusEvents],
      deliveries: [],
      providerRatings: [],
      lastUpdated: new Date().toISOString()
    };
    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  private save(): void {
    this.data.lastUpdated = new Date().toISOString();
    this.persist(this.data);
  }

  // Restaurants
  getRestaurants(): RestaurantDonor[] {
    return this.data.restaurants;
  }

  getRestaurantById(id: string): RestaurantDonor | undefined {
    return this.data.restaurants.find(r => r.id === id);
  }

  addRestaurant(r: RestaurantDonor): RestaurantDonor {
    this.data.restaurants.push(r);
    this.save();
    return r;
  }

  // NGOs
  getNGOs(): RecipientNGO[] {
    return this.data.ngos;
  }

  getNGOById(id: string): RecipientNGO | undefined {
    return this.data.ngos.find(n => n.id === id);
  }

  addNGO(ngo: RecipientNGO): RecipientNGO {
    this.data.ngos.push(ngo);
    this.save();
    return ngo;
  }

  updateNGO(id: string, updates: Partial<RecipientNGO>): RecipientNGO | null {
    const idx = this.data.ngos.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.data.ngos[idx] = { ...this.data.ngos[idx], ...updates };
    this.save();
    return this.data.ngos[idx];
  }

  // Vehicles
  getVehicles(): FleetVehicle[] {
    return this.data.vehicles;
  }

  getVehicleById(id: string): FleetVehicle | undefined {
    return this.data.vehicles.find(v => v.id === id);
  }

  addVehicle(v: FleetVehicle): FleetVehicle {
    this.data.vehicles.push(v);
    this.save();
    return v;
  }

  updateVehicle(id: string, updates: Partial<FleetVehicle>): FleetVehicle | null {
    const idx = this.data.vehicles.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.vehicles[idx] = { ...this.data.vehicles[idx], ...updates };
    this.save();
    return this.data.vehicles[idx];
  }

  // Surplus Events
  getSurplusEvents(): SurplusEvent[] {
    return this.data.surplusEvents;
  }

  getSurplusById(id: string): SurplusEvent | undefined {
    return this.data.surplusEvents.find(s => s.id === id);
  }

  addSurplus(s: SurplusEvent): SurplusEvent {
    this.data.surplusEvents.unshift(s);
    this.save();
    return s;
  }

  updateSurplus(id: string, updates: Partial<SurplusEvent>): SurplusEvent | null {
    const idx = this.data.surplusEvents.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.surplusEvents[idx] = { ...this.data.surplusEvents[idx], ...updates };
    this.save();
    return this.data.surplusEvents[idx];
  }

  deleteSurplus(id: string): boolean {
    const initialLen = this.data.surplusEvents.length;
    this.data.surplusEvents = this.data.surplusEvents.filter(s => s.id !== id);
    if (this.data.surplusEvents.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Deliveries
  getDeliveries(): DeliveryRecord[] {
    return this.data.deliveries;
  }

  getDeliveryById(id: string): DeliveryRecord | undefined {
    return this.data.deliveries.find(d => d.id === id);
  }

  addDelivery(d: DeliveryRecord): DeliveryRecord {
    this.data.deliveries.unshift(d);
    this.save();
    return d;
  }

  updateDelivery(id: string, updates: Partial<DeliveryRecord>): DeliveryRecord | null {
    const idx = this.data.deliveries.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.deliveries[idx] = { ...this.data.deliveries[idx], ...updates };
    this.save();
    return this.data.deliveries[idx];
  }

  getProviderRatings(): ProviderRating[] {
    return this.data.providerRatings;
  }

  getProviderRatingByDeliveryId(deliveryId: string): ProviderRating | undefined {
    return this.data.providerRatings.find(rating => rating.delivery_id === deliveryId);
  }

  upsertProviderRating(rating: ProviderRating): ProviderRating {
    const index = this.data.providerRatings.findIndex(item => item.delivery_id === rating.delivery_id);
    if (index >= 0) this.data.providerRatings[index] = rating;
    else this.data.providerRatings.push(rating);
    this.save();
    return rating;
  }

  // Reset helper
  reset(): void {
    this.data = {
      restaurants: [...initialRestaurants],
      ngos: [...initialNGOs],
      vehicles: [...initialVehicles],
      surplusEvents: [...initialSurplusEvents],
      deliveries: [],
      providerRatings: [],
      lastUpdated: new Date().toISOString()
    };
    this.save();
  }
}

export const store = new Store();
